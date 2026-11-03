<?php
/**
 * User Tickets & Vouchers REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

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

        $ticket = Database::fetchOne("SELECT * FROM `user_tickets` WHERE `id` = ? AND `user_id` = ?", [$ticketId, $userId]);
        if (!$ticket) Database::errorResponse('টিকেট পাওয়া যায়নি।', 404);

        if ($ticket['status'] === 'used') {
            Database::errorResponse('এই টিকেটটি ইতিমধ্যে ব্যবহৃত হয়েছে।', 400);
        }

        Database::update('user_tickets', [
            'status' => 'used',
            'used_time' => date('Y-m-d H:i:s')
        ], "`id` = ?", [$ticketId]);

        // If ticket has monetary amount, credit to user balance
        $amount = (float)($ticket['amount_number'] ?? 0);
        if ($amount > 0) {
            Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$amount, $userId]);
        }

        $updated = Database::fetchOne("SELECT * FROM `user_tickets` WHERE `id` = ?", [$ticketId]);

        Database::jsonResponse([
            'success' => true,
            'message' => "টিকেট (#{$ticket['redeem_code']}) সফলভাবে ব্যবহৃত হয়েছে!",
            'ticket' => $updated
        ]);
        break;

    default:
        Database::errorResponse("Unknown tickets action: {$action}", 404);
        break;
}
