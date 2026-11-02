<?php
/**
 * Referral & Affiliate Program REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/reward_grants.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'stats';
$userId = Database::requireUser();
$input = Database::getJsonInput();

$user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
if (!$user) Database::errorResponse('User not found', 404);

require __DIR__.'/referral_bind.php';
if($action==='claim-tier')Database::errorResponse('Referral tier claims are replaced by the instant per-friend bonus.',409);
require_once __DIR__ . '/promo_rules.php';
/** Medal levels from admin promo rules; progress counts only qualified friends (status active). */
function bbRefLevels(string $uid): array {
    $c = bbPromoRules()['referralLevels'];
    $q = (int)(Database::fetchOne("SELECT COUNT(*) c FROM referrals WHERE referrer_id=? AND status='active'", [$uid])['c'] ?? 0);
    $claimed = array_column(Database::fetchAll("SELECT grant_key FROM reward_grants WHERE user_id=? AND grant_key LIKE 'ref_level:%'", [$uid]), 'grant_key');
    $names = ['সূচনা','রৌপ্য','স্বর্ণ','প্লাটিনাম','ডায়মন্ড','ক্রাউন','মাস্টার','গ্র্যান্ড মাস্টার','লিজেন্ড','রয়্যাল সম্রাট'];
    $out = []; $activeSet = false;
    foreach ($c['tiers'] as $i => $t) {
        $lvl = $i + 1; $need = (int)$t['friends']; $done = in_array("ref_level:$lvl", $claimed, true);
        $elig = !empty($c['enabled']) && !$done && $q >= $need;
        $cur = !$done && !$activeSet; if ($cur) $activeSet = true;
        $out[] = ['id' => $lvl, 'level' => $lvl, 'requiredCount' => $need, 'rewardAmount' => (float)$t['bonus'],
            'name' => "লেভেল $lvl - " . ($names[$i] ?? "লেভেল $lvl") . ' পদক', 'badge' => $names[$i] ?? '',
            'isClaimed' => $done, 'isEligible' => $elig, 'isLocked' => !$done && !$elig && !$cur, 'isCurrentActive' => $cur,
            'progress' => min($q, $need), 'progressPercent' => $need > 0 ? min(100, (int)round($q * 100 / $need)) : 100,
            'friendsNeeded' => max(0, $need - $q), 'formattedReward' => '৳' . number_format((float)$t['bonus'], 2)];
    }
    return ['enabled' => !empty($c['enabled']), 'qualified' => $q, 'levels' => $out];
}
function bbMaskName(?string $s): string { $s = (string)$s; $n = mb_strlen($s); return $n <= 3 ? mb_substr($s, 0, 1) . '**' : mb_substr($s, 0, 2) . '*****' . mb_substr($s, -1); }
/** Top referral earners this month and latest referral payouts, names masked. */
function bbRefBoard(): array {
    $top = Database::fetchAll("SELECT u.username, u.phone, SUM(t.amount) a FROM transactions t JOIN users u ON u.id=t.user_id WHERE t.type='bonus' AND (t.trx_id LIKE 'REF%' OR t.trx_id LIKE 'RLV%') AND t.status='success' AND t.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01') GROUP BY t.user_id ORDER BY a DESC LIMIT 10");
    $recent = Database::fetchAll("SELECT u.username, u.phone, t.amount, t.created_at FROM transactions t JOIN users u ON u.id=t.user_id WHERE t.type='bonus' AND (t.trx_id LIKE 'REF%' OR t.trx_id LIKE 'RLV%') AND t.status='success' ORDER BY t.created_at DESC LIMIT 8");
    return [
        'leaderboard' => array_map(fn($r) => ['name' => bbMaskName($r['username'] ?: $r['phone']), 'amount' => round((float)$r['a'], 2)], $top),
        'recentRewards' => array_map(fn($r) => ['name' => bbMaskName($r['phone'] ?: $r['username']), 'amount' => round((float)$r['amount'], 2), 'at' => $r['created_at']], $recent),
    ];
}
if ($action === 'leaderboard') Database::jsonResponse(['success' => true] + bbRefBoard());
switch ($action) {
    case 'settings':
        $file = __DIR__ . '/../data/referral_settings.json';
        Database::jsonResponse(['success' => true, 'settings' => bbReferralSettings()]);
        break;

    case 'stats':
        $refCode = $user['referral_code'] ?? 'BDT888';
        $domain = 'https://bengalbet.vip';
        $refLink = "{$domain}/?ref={$refCode}";

        $friends = Database::fetchAll("SELECT * FROM `referrals` WHERE `referrer_id` = ?", [$user['id']]);
        $totalFriends = count($friends);
        $qualifiedFriends = 0;
        $depositedFriends = 0;
        $depositCommissionTotal = 0;
        $betRebateTotal = 0;

        foreach ($friends as $f) {
            if ($f['status'] === 'active') $qualifiedFriends++;
            if ((float)$f['total_deposit'] > 0) $depositedFriends++;
            $depositCommissionTotal += (float)$f['deposit_commission'];
            $betRebateTotal += (float)$f['bet_commission'];
        }

        $claims = Database::fetchAll("SELECT `tier_id` FROM `referral_claims` WHERE `user_id` = ?", [$user['id']]);
        $claimedTierIds = array_map(function($c) { return (int)$c['tier_id']; }, $claims);

        Database::jsonResponse([
            'success' => true,
            'referralCode' => $refCode,
            'referralLink' => $refLink,
            'totalFriends' => $totalFriends,
            'qualifiedFriends' => $qualifiedFriends,
            'depositedFriends' => $depositedFriends,
            'todayFriendsCount' => (int)(Database::fetchOne("SELECT COUNT(*) c FROM `referrals` WHERE `referrer_id` = ? AND DATE(`joined_at`) = CURDATE()", [$user['id']])['c'] ?? 0),
            'yesterdayFriendsCount' => (int)(Database::fetchOne("SELECT COUNT(*) c FROM `referrals` WHERE `referrer_id` = ? AND DATE(`joined_at`) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)", [$user['id']])['c'] ?? 0),
            'thisMonthFriendsCount' => (int)(Database::fetchOne("SELECT COUNT(*) c FROM `referrals` WHERE `referrer_id` = ? AND `joined_at` >= DATE_FORMAT(CURDATE(), '%Y-%m-01')", [$user['id']])['c'] ?? 0),
            'totalEarnings' => (float)$user['total_earnings'],
            // Only the instant referral bonus has a dated ledger row (trx_id REF...); commissions are lifetime totals.
            'todayCommission' => (float)(Database::fetchOne("SELECT COALESCE(SUM(amount),0) a FROM transactions WHERE user_id = ? AND type = 'bonus' AND trx_id LIKE 'REF%' AND DATE(created_at) = CURDATE()", [$user['id']])['a'] ?? 0),
            'yesterdayCommission' => (float)(Database::fetchOne("SELECT COALESCE(SUM(amount),0) a FROM transactions WHERE user_id = ? AND type = 'bonus' AND trx_id LIKE 'REF%' AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)", [$user['id']])['a'] ?? 0),
            'breakdown' => [
                'instantRewardTotal' => round(array_sum(array_map(fn($f) => (float)($f['instant_bonus_amount'] ?? 0), $friends)), 2),
                'milestoneRewardTotal' => (float)(Database::fetchOne("SELECT COALESCE(SUM(amount),0) a FROM transactions WHERE user_id = ? AND type = 'bonus' AND trx_id LIKE 'RLV%'", [$user['id']])['a'] ?? 0),
                'depositCommissionTotal' => round($depositCommissionTotal, 2),
                'betRebateTotal' => round($betRebateTotal, 2),
                'todayInstantReward' => 0,
                'todayMilestoneReward' => 0,
                'todayDepositCommission' => 0,
                'todayBetRebate' => 0
            ],
            'claimedTierIds' => $claimedTierIds,
            'poroskarLevels' => ($lv = bbRefLevels($user['id']))['levels'],
            'nextPoroskarLevel' => (function ($l) { foreach ($l as $x) if (!$x['isClaimed']) return $x; return null; })($lv['levels']),
            'referralLevelsEnabled' => $lv['enabled'],
            'commissionRates' => (function () { $rs = bbReferralSettings(); return [
                'instantBonus' => (float)$rs['instantBonusPerFriend'],
                'minDeposit' => (float)$rs['minDepositToQualify'],
                'minTurnover' => (float)$rs['minBetTurnoverToQualify'],
                'depositRate' => (float)$rs['depositRebateRate'],
                'betRate' => (float)$rs['betTurnoverRebateRate'],
                'maxBonusCap' => (float)$rs['maxBonusCap']
            ]; })()
        ]);
        break;

    case 'friends':
        $friends = Database::fetchAll("SELECT * FROM `referrals` WHERE `referrer_id` = ? ORDER BY `joined_at` DESC", [$user['id']]);
        Database::jsonResponse([
            'success' => true,
            'friends' => $friends,
            'total' => count($friends)
        ]);
        break;

    case 'records':
        $claims = Database::fetchAll("SELECT * FROM `referral_claims` WHERE `user_id` = ? ORDER BY `claimed_at` DESC", [$user['id']]);
        $formatted = array_map(function($c) {
            return [
                'id' => $c['id'],
                'regDate' => substr($c['claimed_at'], 0, 10),
                'username' => 'Referral Reward',
                'category' => $c['type'] === 'milestone_level' ? 'মাইলস্টোন বোনাস' : 'টিয়ার রিওয়ার্ড',
                'amount' => '৳' . number_format((float)$c['bonus_amount'], 2),
                'status' => 'সফল'
            ];
        }, $claims);

        Database::jsonResponse([
            'success' => true,
            'records' => $formatted,
            'total' => count($formatted)
        ]);
        break;

    case 'claim-tier':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $tierId = (int)($input['tierId'] ?? 1);
        $bonus = 300.00;

        $already = Database::fetchOne("SELECT `id` FROM `referral_claims` WHERE `user_id` = ? AND `tier_id` = ?", [$user['id'], $tierId]);
        if ($already) Database::errorResponse('এই টিয়ার বোনাসটি ইতিমধ্যে দাবি করা হয়েছে।', 400);

        $claimId = 'rfc-' . uniqid();
        $trxId = 'REF' . date('YmdHis') . rand(100, 999);

        Database::insert('referral_claims', [
            'id' => $claimId,
            'user_id' => $user['id'],
            'tier_id' => $tierId,
            'type' => 'tier',
            'required_count' => $tierId,
            'bonus_amount' => $bonus,
            'trx_id' => $trxId,
            'claimed_at' => date('Y-m-d H:i:s')
        ]);

        Database::execute("UPDATE `users` SET `balance` = `balance` + ?, `total_earnings` = `total_earnings` + ? WHERE `id` = ?", [$bonus, $bonus, $user['id']]);

        Database::insert('transactions', [
            'id' => 'tx-' . uniqid(),
            'user_id' => $user['id'],
            'type' => 'bonus',
            'amount' => $bonus,
            'channel' => 'system',
            'trx_id' => $trxId,
            'status' => 'success',
            'description' => "রেফারেল টিয়ার #{$tierId} বোনাস",
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $newBal = (float)$user['balance'] + $bonus;

        Database::jsonResponse([
            'success' => true,
            'message' => "৳{$bonus} রেফারেল বোনাস সফলভাবে অ্যাকাউন্টে জমা হয়েছে!",
            'bonusAmount' => $bonus,
            'newBalance' => $newBal
        ]);
        break;

    case 'claim-poroskar-level':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $level = (int)($input['level'] ?? 0);
        $pdo = Database::getConnection();
        try {
            $pdo->beginTransaction();
            $u = Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE', [$user['id']]);
            if (!$u || $u['status'] !== 'active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
            $st = bbRefLevels($u['id']); $l = $st['levels'][$level - 1] ?? null;
            if (!$st['enabled']) throw new RuntimeException('রেফার লেভেল পুরস্কার এখন বন্ধ।');
            if (!$l) throw new RuntimeException('লেভেল পাওয়া যায়নি।');
            if ($l['isClaimed']) throw new RuntimeException('এই লেভেল পুরস্কার ইতিমধ্যে নেওয়া হয়েছে।');
            if (!$l['isEligible']) throw new RuntimeException("আরও {$l['friendsNeeded']} জন যোগ্য বন্ধু দরকার।");
            if (!bbGrantOnce($u['id'], "ref_level:$level")) throw new RuntimeException('এই লেভেল পুরস্কার ইতিমধ্যে নেওয়া হয়েছে।');
            $bonus = (float)$l['rewardAmount']; $trxId = 'RLV' . date('YmdHis') . random_int(100, 999);
            Database::insert('referral_claims', ['id' => 'rfc-p-' . bin2hex(random_bytes(6)), 'user_id' => $u['id'], 'level' => $level, 'type' => 'milestone_level', 'required_count' => $l['requiredCount'], 'bonus_amount' => $bonus, 'trx_id' => $trxId, 'claimed_at' => date('Y-m-d H:i:s')]);
            Database::execute('UPDATE users SET balance=balance+?, total_earnings=total_earnings+? WHERE id=?', [$bonus, $bonus, $u['id']]);
            Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $u['id'], 'username' => $u['username'], 'user_phone' => $u['phone'], 'type' => 'bonus', 'amount' => $bonus, 'channel' => 'system', 'trx_id' => $trxId, 'status' => 'success', 'description' => "রেফার লেভেল {$level} পুরস্কার", 'created_at' => date('Y-m-d H:i:s')]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'Level reward could not be processed', 400);
        }
        $bal = (float)Database::fetchOne('SELECT balance FROM users WHERE id=?', [$user['id']])['balance'];
        Database::jsonResponse(['success' => true, 'message' => "লেভেল {$level} পুরস্কার ৳{$bonus} যোগ হয়েছে।", 'bonusAmount' => $bonus, 'newBalance' => $bal]);
        break;

    case 'bind-code':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $code = trim($input['code'] ?? '');
        if (empty($code)) Database::errorResponse('রেফারেল কোড দিন।', 400);

        $referrer = Database::fetchOne("SELECT * FROM `users` WHERE `referral_code` = ?", [$code]);
        if (!$referrer) Database::errorResponse('অবৈধ রেফারেল কোড!', 404);
        if ($referrer['id'] === $user['id']) Database::errorResponse('নিজের রেফারেল কোড ব্যবহার করা যাবে না।', 400);

        Database::jsonResponse([
            'success' => true,
            'message' => 'রেফারেল কোড সফলভাবে যুক্ত করা হয়েছে!'
        ]);
        break;

    default:
        Database::errorResponse("Unknown referral action: {$action}", 404);
        break;
}
