<?php
/**
 * Mystery Reward (23rd of month drop) REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'status';
$userId = Database::requireUser();
$input = Database::getJsonInput();

$currentDay = (int)date('j');
$currentHour = (int)date('G');
$monthYear = date('Y-m');

$rewardModule='mystery'; require __DIR__.'/reward_settlement.php';
switch ($action) {
    case 'status':
        $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
        $card = Database::fetchOne("SELECT * FROM `mystery_cash_cards` WHERE `user_id` = ? AND `month_year` = ?", [$userId, $monthYear]);

        $is23rd = ($currentDay === 23);
        $isPast6PM = ($currentHour >= 18);
        $isUnlocked = ($is23rd && $isPast6PM) || ($card && $card['status'] === 'unlocked');

        // Sum bets for user this month
        $betSum = Database::fetchOne("SELECT SUM(`bet_amount`) as total FROM `bets` WHERE `user_id` = ? AND `date` LIKE ?", [$userId, "{$monthYear}%"]);
        $userBetTotal = (float)($betSum['total'] ?? 0);
        $minBetRequired = 500.00;

        Database::jsonResponse([
            'success' => true,
            'currentDate' => date('Y-m-d H:i:s'),
            'is23rdToday' => $is23rd,
            'isPast6PM' => $isPast6PM,
            'isUnlocked' => $isUnlocked,
            'hasClaimed' => ($card && $card['status'] === 'claimed'),
            'claimedCard' => ($card && $card['status'] === 'claimed') ? $card : null,
            'unlockedCard' => ($card && $card['status'] === 'unlocked') ? $card : null,
            'userBetTotal' => $userBetTotal,
            'minBetRequired' => $minBetRequired,
            'isBetSatisfied' => ($userBetTotal >= $minBetRequired),
            'isPhoneVerified' => true,
            'isEmailVerified' => !empty($user['email']),
            'isEligible' => ($userBetTotal >= $minBetRequired),
            'countdownToDrop' => [
                'days' => $is23rd ? 0 : max(0, 23 - $currentDay),
                'hours' => $is23rd ? max(0, 18 - $currentHour) : 18,
                'minutes' => 0,
                'seconds' => 0,
                'isReady' => ($is23rd && $isPast6PM)
            ]
        ]);
        break;

    case 'claim':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);

        $card = Database::fetchOne("SELECT * FROM `mystery_cash_cards` WHERE `user_id` = ? AND `month_year` = ?", [$userId, $monthYear]);
        if ($card && $card['status'] === 'claimed') {
            Database::errorResponse('আপনি চলতি মাসের ২৩ তারিখের রহস্যময় পুরস্কার ইতিমধ্যে গ্রহণ করেছেন।', 400);
        }

        $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
        if (!$user) Database::errorResponse('User not found', 404);

        $bonusAmount = $card ? (float)$card['bonus_amount'] : 2500.00;
        $ticketCode = 'BENGAL-MYSTERY-' . strtoupper(substr(md5(uniqid()), 0, 8));

        if ($card) {
            Database::update('mystery_cash_cards', [
                'status' => 'claimed',
                'claimed_at' => date('Y-m-d H:i:s')
            ], "`id` = ?", [$card['id']]);
        } else {
            Database::insert('mystery_cash_cards', [
                'id' => 'mcc-' . uniqid(),
                'user_id' => $userId,
                'username' => $user['username'],
                'month_year' => $monthYear,
                'bonus_amount' => $bonusAmount,
                'status' => 'claimed',
                'eligible' => 1,
                'user_bet_amount' => 500.00,
                'turnover_required' => $bonusAmount,
                'turnover_completed' => 0,
                'ticket_code' => $ticketCode,
                'unlocked_at' => date('Y-m-d H:i:s'),
                'claimed_at' => date('Y-m-d H:i:s')
            ]);
        }

        $newBal = (float)$user['balance'] + $bonusAmount;
        Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$bonusAmount, $userId]);

        // Transaction record
        Database::insert('transactions', [
            'id' => 'tx-' . uniqid(),
            'user_id' => $userId,
            'type' => 'bonus',
            'amount' => $bonusAmount,
            'channel' => 'system',
            'trx_id' => 'MYS' . date('YmdHis') . rand(100, 999),
            'status' => 'success',
            'description' => "প্রতি মাসের ২৩ তারিখ রহস্যময় পুরস্কার (৳{$bonusAmount})",
            'created_at' => date('Y-m-d H:i:s')
        ]);

        Database::jsonResponse([
            'success' => true,
            'message' => "অভিনন্দন! ২৩ তারিখের রহস্যময় পুরস্কার ৳{$bonusAmount} ক্যাশ কার্ড সফলভাবে আনলক হয়েছে!",
            'bonusAmount' => $bonusAmount,
            'turnoverRequired' => $bonusAmount,
            'newBalance' => $newBal,
            'card' => [
                'monthYear' => $monthYear,
                'bonusAmount' => $bonusAmount,
                'status' => 'claimed',
                'ticketCode' => $ticketCode
            ],
            'ticket' => [
                'code' => $ticketCode,
                'name' => '২৩ তারিখ রহস্যময় ক্যাশ কার্ড',
                'amount' => '৳' . number_format($bonusAmount, 2)
            ]
        ]);
        break;

    default:
        Database::errorResponse("Unknown mystery reward action: {$action}", 404);
        break;
}
