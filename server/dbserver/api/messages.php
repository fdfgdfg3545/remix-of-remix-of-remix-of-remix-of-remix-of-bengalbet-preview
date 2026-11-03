<?php
/**
 * Messages & Notifications REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

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

        $msg = Database::fetchOne("SELECT * FROM `messages` WHERE `id` = ?", [$msgId]);
        if (!$msg) Database::errorResponse('মেসেজটি পাওয়া যায়নি।', 404);

        $bonus = (float)$msg['claimable_bonus'];
        if ($bonus <= 0) {
            Database::errorResponse('এই মেসেজে কোনো দাবিযোগ্য বোনাস নেই।', 400);
        }

        $alreadyClaimed = Database::fetchOne("SELECT `id` FROM `message_claims` WHERE `message_id` = ? AND `user_id` = ?", [$msgId, $userId]);
        if ($alreadyClaimed) {
            Database::errorResponse('আপনি ইতিমধ্যে এই বোনাসটি দাবি করেছেন।', 400);
        }

        // Record claim
        Database::insert('message_claims', [
            'id' => 'mc-' . uniqid(),
            'message_id' => $msgId,
            'user_id' => $userId,
            'claimed_at' => date('Y-m-d H:i:s')
        ]);

        // Credit balance
        Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$bonus, $userId]);

        // Record transaction
        Database::insert('transactions', [
            'id' => 'tx-' . uniqid(),
            'user_id' => $userId,
            'type' => 'bonus',
            'amount' => $bonus,
            'channel' => 'inbox_bonus',
            'trx_id' => 'MSG' . date('YmdHis') . rand(100, 999),
            'status' => 'success',
            'description' => "ইনবক্স মেসেজ বোনাস: {$msg['title']}",
            'created_at' => date('Y-m-d H:i:s')
        ]);

        Database::jsonResponse([
            'success' => true,
            'amount' => $bonus,
            'message' => "৳{$bonus} ইনবক্স বোনাস সফলভাবে জমা হয়েছে!"
        ]);
        break;

    default:
        Database::errorResponse("Unknown message action: {$action}", 404);
        break;
}
