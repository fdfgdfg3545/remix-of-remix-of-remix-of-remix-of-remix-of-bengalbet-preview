<?php
/**
 * User Tickets & Vouchers REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__.'/bonus_eligibility.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'my';
$userId = Database::requireUser();
$input = Database::getJsonInput();

switch ($action) {
    case 'my':
    case 'list':
    case '':
        $category = $_GET['category'] ?? '';
        $status = $_GET['status'] ?? '';

        $sql = "SELECT * FROM `user_tickets` WHERE `user_id` = ?";
        $params = [$userId];

        if (!empty($category) && $category !== 'all') {
            $sql .= " AND `type` = ?";
            $params[] = $category;
        }
        if (!empty($status) && $status !== 'all') {
            $sql .= " AND `status` = ?";
            $params[] = $status;
        }

        $sql .= " ORDER BY `created_at` DESC LIMIT 50";
        $tickets = Database::fetchAll($sql, $params);

        Database::jsonResponse([
            'success' => true,
            'tickets' => $tickets,
            'total' => count($tickets)
        ]);
        break;

    case 'use':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $ticketId = trim($input['ticketId'] ?? '');

        if (empty($ticketId)) Database::errorResponse('Ticket ID is required', 400);

        $pdo=Database::getConnection();
        try {
            $pdo->beginTransaction();
            $u=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$userId]);
            if(!$u || $u['status']!=='active')throw new RuntimeException('Active account required');
            bbRequireBonusDeposit($userId);
            $ticket=Database::fetchOne('SELECT * FROM user_tickets WHERE id=? AND user_id=? FOR UPDATE',[$ticketId,$userId]);
            if(!$ticket || !in_array($ticket['status'],['active','ready'],true))throw new RuntimeException('টিকিট নেই অথবা ব্যবহার হয়েছে।');
            $amount=(float)($ticket['amount_number']??0);
            if($amount>0){
                Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$amount,$userId]);
                Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'type'=>'bonus','amount'=>$amount,'channel'=>'system','trx_id'=>$ticketId,'status'=>'success','description'=>'টিকিট নগদ পুরস্কার','created_at'=>date('Y-m-d H:i:s')]);
            }
            Database::update('user_tickets',['status'=>'used','used_time'=>date('Y-m-d H:i:s')],'id=?',[$ticketId]);
            $updated=Database::fetchOne('SELECT * FROM user_tickets WHERE id=?',[$ticketId]);
            $pdo->commit();Database::jsonResponse(['success'=>true,'message'=>'টিকিট গ্রহণ হয়েছে।','ticket'=>$updated,'newBalance'=>round((float)$u['balance']+$amount,2)]);
        }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'Ticket could not be saved',400);}
        break;

    default:
        Database::errorResponse("Unknown tickets action: {$action}", 404);
        break;
}
