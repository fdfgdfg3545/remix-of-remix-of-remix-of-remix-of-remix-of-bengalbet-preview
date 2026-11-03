<?php
/**
 * Messages & Notifications REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__.'/bonus_eligibility.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$msgId = $_GET['id'] ?? '';
$userId = Database::requireUser();

switch ($action) {
    case 'list':
    case '':
        // Fetch global messages and specific user messages
        $messages = Database::fetchAll("SELECT * FROM `messages` WHERE `user_id` = 'all' OR `user_id` = ? ORDER BY `created_at` DESC LIMIT 50", [$userId]);
        
        $unreadCount = 0;
        $formatted = [];
        foreach ($messages as $m) {
            if (!$m['is_read']) $unreadCount++;
            $content = json_decode($m['content_json'] ?? '{}', true) ?: [];
            
            // Check if claimable bonus was already claimed by user
            $claimed = Database::fetchOne("SELECT `id` FROM `message_claims` WHERE `message_id` = ? AND `user_id` = ?", [$m['id'], $userId]);

            $formatted[] = [
                'id' => $m['id'],
                'sender' => $m['sender'],
                'title' => $m['title'],
                'displayTime' => $m['display_time'],
                'dateFull' => $m['date_full'],
                'isRead' => (bool)$m['is_read'],
                'category' => $m['category'],
                'claimableBonus' => (float)$m['claimable_bonus'],
                'isClaimed' => (bool)$claimed,
                'content' => $content
            ];
        }

        Database::jsonResponse([
            'success' => true,
            'messages' => $formatted,
            'unreadCount' => $unreadCount
        ]);
        break;

    case 'read':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        if (!empty($msgId)) {
            Database::update('messages', ['is_read' => 1], "`id` = ?", [$msgId]);
        }
        Database::jsonResponse(['success' => true]);
        break;

    case 'delete':
        if ($method !== 'DELETE') Database::errorResponse('Method Not Allowed', 405);
        if (!empty($msgId)) {
            Database::delete('messages', "`id` = ?", [$msgId]);
        }
        Database::jsonResponse(['success' => true]);
        break;

    case 'claim':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        if (empty($msgId)) Database::errorResponse('Message ID is required', 400);

        $pdo=Database::getConnection();
        try {
            $pdo->beginTransaction();
            $u=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$userId]);
            if(!$u || $u['status']!=='active')throw new RuntimeException('Active account required');
            bbRequireBonusDeposit($userId);
            $msg=Database::fetchOne("SELECT * FROM messages WHERE id=? AND (user_id=? OR user_id='all') FOR UPDATE",[$msgId,$userId]);
            if(!$msg || (float)$msg['claimable_bonus']<=0)throw new RuntimeException('এই মেসেজে কোনো দাবিযোগ্য বোনাস নেই।');
            if(Database::fetchOne('SELECT id FROM message_claims WHERE message_id=? AND user_id=?',[$msgId,$userId]))throw new RuntimeException('ইতিমধ্যে গ্রহণ করেছেন।');
            $bonus=(float)$msg['claimable_bonus'];
            Database::insert('message_claims',['id'=>'mc-'.bin2hex(random_bytes(12)),'message_id'=>$msgId,'user_id'=>$userId,'claimed_at'=>date('Y-m-d H:i:s')]);
            Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$bonus,$userId]);
            Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'type'=>'bonus','amount'=>$bonus,'channel'=>'inbox_bonus','trx_id'=>'MSG'.bin2hex(random_bytes(12)),'status'=>'success','description'=>'ইনবক্স বোনাস','created_at'=>date('Y-m-d H:i:s')]);
            $pdo->commit();Database::jsonResponse(['success'=>true,'amount'=>$bonus,'newBalance'=>round((float)$u['balance']+$bonus,2),'message'=>'ইনবক্স বোনাস গ্রহণ হয়েছে।']);
        }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'Bonus could not be saved',400);}
        break;

    default:
        Database::errorResponse("Unknown message action: {$action}", 404);
        break;
}
