<?php
/**
 * Wallet & Transactions REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = Database::getJsonInput();
$userId = Database::requireUser();

require __DIR__.'/turnover_guard.php';
require __DIR__.'/withdraw_guard.php';
switch ($action) {
    case 'balance':
        require_once __DIR__ . '/vip_progress.php'; bbVipSync($userId);
        $user = Database::fetchOne("SELECT `balance`, `vip_level`, `vip_exp`, `vip_max_exp` FROM `users` WHERE `id` = ?", [$userId]);
        if (!$user) {
            $user = ['balance' => 0.00, 'vip_level' => 0, 'vip_exp' => 0, 'vip_max_exp' => 2000];
        }
        Database::jsonResponse([
            'success' => true,
            'balance' => (float)$user['balance'],
            'vipLevel' => (int)$user['vip_level'],
            'vipExp' => (int)$user['vip_exp']
        ]);
        break;

    case 'deposit':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        require_once __DIR__ . '/deposit_offer_rules.php';
        $amount = round((float)($input['amount'] ?? 0), 2);
        $methodName = strtolower(trim($input['method'] ?? 'bkash'));
        $gateway = substr(trim($input['gateway'] ?? 'পরিশোধ-DK'), 0, 60);
        $senderAccount = substr(trim($input['senderAccount'] ?? ''), 0, 40);
        $trxId = substr(trim($input['trxId'] ?? ('DP' . date('YmdHis') . rand(100, 999))), 0, 60);
        $limits = Database::fetchOne("SELECT `min_deposit`, `max_deposit` FROM `site_settings` WHERE `id` = 1");
        $minDep = $limits ? (float)$limits['min_deposit'] : 200.0;
        $maxDep = $limits ? (float)$limits['max_deposit'] : 50000.0;
        if (!is_finite($amount) || $amount < $minDep) Database::errorResponse('ন্যূনতম ডিপোজিট পরিমাণ ৳' . $minDep, 400);
        if ($amount > $maxDep) Database::errorResponse('সর্বোচ্চ ডিপোজিট পরিমাণ ৳' . $maxDep, 400);
        // Older clients did not send the choice; they keep the previous opted-in behaviour.
        $optIn = array_key_exists('claimBonus', $input) ? ($input['claimBonus'] === true) : true;

        $pdo = Database::getConnection();
        try {
            $pdo->beginTransaction();
            $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ? FOR UPDATE", [$userId]);
            if (!$user) throw new RuntimeException('User not found');
            $prior = Database::fetchOne("SELECT COUNT(*) AS c FROM `transactions` WHERE `user_id` = ? AND `type` = 'deposit' AND `status` IN ('pending','success')", [$userId]);
            $offer = bbDepositOffer();
            $bonus = bbDepositBonus($offer, $amount, $optIn, (int)($prior['c'] ?? 0) > 0);
            $txId = 'tx-' . uniqid();
            $txData = [
                'id' => $txId,
                'user_id' => $userId,
                'username' => $user['username'],
                'user_phone' => $user['phone'],
                'type' => 'deposit',
                'amount' => $amount,
                'bonus' => $bonus,
                'fee' => 0.00,
                'channel' => in_array($methodName, ['bkash', 'nagad', 'rocket', 'usdt']) ? $methodName : 'bkash',
                'gateway' => $gateway,
                'account_number' => $senderAccount ?: $user['phone'],
                'trx_id' => $trxId,
                'status' => 'pending',
                'description' => "{$gateway} ডিপোজিট অনুরোধ — অ্যাডমিন যাচাইয়ের অপেক্ষায়" . ($bonus > 0 ? " (বোনাস ৳{$bonus})" : ''),
                'created_at' => date('Y-m-d H:i:s')
            ];
            Database::insert('transactions', $txData);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Database::errorResponse($e instanceof RuntimeException ? $e->getMessage() : 'ডিপোজিট অনুরোধ জমা হয়নি', 400);
        }

        Database::jsonResponse([
            'success' => true,
            'message' => 'ডিপোজিট অনুরোধ জমা হয়েছে! অ্যাডমিন যাচাই করার পর ব্যালেন্সে যোগ হবে।',
            'newBalance' => (float)$user['balance'],
            'bonusAdded' => $bonus,
            'pending' => true,
            'transaction' => $txData
        ]);
        break;

    case 'withdraw':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $amount = (float)($input['amount'] ?? 0);
        $walletType = strtolower(trim($input['walletType'] ?? 'bkash'));
        $accountNumber = trim($input['accountNumber'] ?? '');

        if ($amount < 500) {
            Database::errorResponse('ন্যূনতম উত্তোলন পরিমাণ ৳৫০০', 400);
        }

        $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
        if (!$user) Database::errorResponse('User not found', 404);

        if ((float)$user['balance'] < $amount) {
            Database::errorResponse('আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!', 400);
        }

        $newBalance = (float)$user['balance'] - $amount;
        $trxId = 'WD' . date('YmdHis') . rand(100, 999);

        // Insert transaction record (marked as pending/processing for security, balance deducted)
        $txId = 'tx-' . uniqid();
        $txData = [
            'id' => $txId,
            'user_id' => $userId,
            'username' => $user['username'],
            'user_phone' => $user['phone'],
            'type' => 'withdraw',
            'amount' => $amount,
            'bonus' => 0.00,
            'fee' => 0.00,
            'channel' => in_array($walletType, ['bkash', 'nagad', 'rocket', 'usdt']) ? $walletType : 'bkash',
            'account_number' => $accountNumber ?: $user['phone'],
            'trx_id' => $trxId,
            'status' => 'pending',
            'description' => "{$walletType} ওয়ালেট উত্তোলন অনুরোধ",
            'created_at' => date('Y-m-d H:i:s')
        ];
        Database::insert('transactions', $txData);

        // Deduct balance
        Database::update('users', ['balance' => $newBalance], "`id` = ?", [$userId]);

        Database::jsonResponse([
            'success' => true,
            'message' => 'উত্তোলন অনুরোধ সফলভাবে জমা হয়েছে! অ্যাডমিন অনুমোদনের পর টাকা পৌঁছে যাবে।',
            'newBalance' => $newBalance,
            'transaction' => $txData
        ]);
        break;

    case 'transactions':
        $type = $_GET['type'] ?? '';
        $sql = "SELECT * FROM `transactions` WHERE `user_id` = ?";
        $params = [$userId];

        if (!empty($type) && $type !== 'all') {
            $sql .= " AND `type` = ?";
            $params[] = $type;
        }

        $sql .= " ORDER BY `created_at` DESC LIMIT 100";
        $transactions = Database::fetchAll($sql, $params);

        Database::jsonResponse([
            'success' => true,
            'count' => count($transactions),
            'transactions' => $transactions
        ]);
        break;

    case 'cards':
        if ($method === 'GET') {
            $cards = Database::fetchAll("SELECT * FROM `wallets` WHERE `user_id` = ? ORDER BY `created_at` DESC", [$userId]);
            Database::jsonResponse([
                'success' => true,
                'wallets' => $cards
            ]);
        } elseif ($method === 'POST') {
            $type = trim($input['type'] ?? 'BKash');
            $accountName = trim($input['accountName'] ?? '');
            $accountNumber = trim($input['accountNumber'] ?? '');

            if (empty($accountNumber)) {
                Database::errorResponse('অ্যাকাউন্ট নম্বর আবশ্যক।', 400);
            }

            $masked = substr($accountNumber, 0, 3) . '****' . substr($accountNumber, -4);
            $cardId = 'wal-' . uniqid();
            $cardData = [
                'id' => $cardId,
                'user_id' => $userId,
                'type' => $type,
                'account_name' => $accountName ?: 'My Wallet',
                'account_number' => $masked,
                'full_number' => $accountNumber,
                'is_default' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ];

            Database::insert('wallets', $cardData);

            Database::jsonResponse([
                'success' => true,
                'message' => 'ওয়ালেট সফলভাবে যুক্ত করা হয়েছে!',
                'wallet' => $cardData
            ]);
        }
        break;

    case 'delete-card':
        $cardId = $_GET['id'] ?? $input['id'] ?? '';
        if (empty($cardId)) Database::errorResponse('Card ID is required', 400);

        Database::delete('wallets', "`id` = ? AND `user_id` = ?", [$cardId, $userId]);
        Database::jsonResponse([
            'success' => true,
            'message' => 'ওয়ালেট সফলভাবে মুছে ফেলা হয়েছে!'
        ]);
        break;

    default:
        Database::errorResponse("Unknown wallet action: {$action}", 404);
        break;
}
