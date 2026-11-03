<?php
/**
 * Server-authoritative chance rewards (spin, golden egg, red envelope).
 * The member never sends an amount: the server picks the prize from the
 * administrator-approved table in data/chance_rewards.json and fails closed
 * when that table is missing or invalid.
 */
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/reward_grants.php';

$userId = Database::requireUser();
$input = Database::getJsonInput();
if (in_array($_GET['action'] ?? '', ['vip-salary-cards','vip-salary-redeem'], true)) {
    require_once __DIR__.'/vip_salary.php';
    if($_GET['action']==='vip-salary-cards' && $_SERVER['REQUEST_METHOD']==='GET') {
        $rows=Database::fetchAll('SELECT * FROM vip_salary_cards WHERE user_id=? ORDER BY created_at DESC',[$userId]);
        Database::jsonResponse(['success'=>true,'tickets'=>array_map('bbSalaryCardView',$rows)]);
    }
    if($_GET['action']==='vip-salary-redeem' && $_SERVER['REQUEST_METHOD']==='POST') {
        try {Database::jsonResponse(bbSalaryRedeem($userId,(string)($input['ticketId']??'')));}
        catch(Throwable $e){Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'VIP কার্ড গ্রহণ করা যায়নি।',400);}
    }
    Database::errorResponse('Method Not Allowed',405);
}
$type = trim((string)($input['type'] ?? ''));
$counters = ['spin' => 'free_spins', 'golden_egg' => 'golden_eggs_available', 'red_envelope' => 'red_packets_available'];

if (($_GET['action'] ?? '') === 'table' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $t = bbChanceTable(in_array($_GET['type'] ?? '', ['spin','golden_egg','red_envelope'], true) ? $_GET['type'] : 'spin');
    Database::jsonResponse(['success' => true, 'prizes' => array_map(fn($r) => ['label' => $r['label'] ?? ('৳' . $r['amount']), 'amount' => (float)$r['amount']], $t)]);
}
if (($_GET['action'] ?? '') === 'packet-round' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $round = bbPacketWindow();
    $taken = $round ? (int)Database::fetchOne('SELECT COUNT(*) AS c FROM reward_grants WHERE grant_key = ?', ['packet:' . $round])['c'] : 0;
    $mine = $round ? (bool)Database::fetchOne('SELECT 1 AS x FROM reward_grants WHERE user_id = ? AND grant_key = ?', [$userId, 'packet:' . $round]) : false;
    Database::jsonResponse(['success' => true, 'open' => (bool)$round && $taken < bbPacketLimit() && !$mine, 'round' => $round, 'remaining' => max(0, bbPacketLimit() - $taken), 'claimed' => $mine, 'schedule' => bbPacketHoursText(), 'serverTime' => date('Y-m-d H:i:s')]);
}
require __DIR__ . '/turnover_offers.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') Database::errorResponse('Method Not Allowed', 405);
if (($_GET['action'] ?? '') === 'app-bonus') {
    // Plan: app download bonus once per member account
    $ab = bbPromoRules()['appBonus'];
    if (empty($ab['enabled']) || (float)$ab['amount'] <= 0) Database::errorResponse('অ্যাপ বোনাস এখন চালু নেই।', 409);
    $pdo = Database::getConnection();
    try {
        $pdo->beginTransaction();
        $user = Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE', [$userId]);
        if (!$user || $user['status'] !== 'active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
        if (!bbGrantOnce($userId, 'app_bonus')) throw new RuntimeException('অ্যাপ বোনাস আগেই নেওয়া হয়েছে।');
        $amt = round((float)$ab['amount'], 2);
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?', [$amt, $userId]);
        Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $userId, 'username' => $user['username'], 'user_phone' => $user['phone'], 'type' => 'bonus', 'amount' => $amt, 'channel' => 'system', 'trx_id' => 'APP' . date('YmdHis') . random_int(100, 999), 'status' => 'success', 'description' => "অ্যাপ ডাউনলোড বোনাস ৳{$amt}", 'created_at' => date('Y-m-d H:i:s')]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'Bonus could not be processed', 400);
    }
    $bal = (float)Database::fetchOne('SELECT balance FROM users WHERE id=?', [$userId])['balance'];
    Database::jsonResponse(['success' => true, 'amount' => $amt, 'newBalance' => $bal]);
}
if (!isset($counters[$type])) Database::errorResponse('Dedicated reward eligibility required; generic cash claim disabled.', 403);
function bbChanceTable(string $type): array {
    $file = __DIR__ . '/../data/chance_rewards.json';
    $cfg = is_file($file) ? json_decode((string)file_get_contents($file), true) : null;
    $rows = is_array($cfg) ? ($cfg[$type] ?? null) : null;
    if (!is_array($rows) || !count($rows) || count($rows) > 20) return [];
    $total = 0.0;
    foreach ($rows as $r) {
        $amt = $r['amount'] ?? null; $w = $r['weight'] ?? null;
        if (!is_numeric($amt) || !is_numeric($w) || $amt < 0 || $amt > 150000 || $w <= 0) return [];
        $total += (float)$w;
    }
    return $total > 0 ? $rows : [];
}

$table = bbChanceTable($type);
if (!$table) Database::errorResponse('Prize table not approved by an administrator yet.', 409);

$total = array_sum(array_map(fn($r) => (float)$r['weight'], $table));
$pick = random_int(1, 1000000) / 1000000 * $total; $index = count($table) - 1;
foreach ($table as $i => $r) { $pick -= (float)$r['weight']; if ($pick <= 0) { $index = $i; break; } }
$prize = $table[$index];
$amount = round((float)$prize['amount'], 2);
$label = substr((string)($prize['label'] ?? ('৳' . $amount)), 0, 60);
$col = $counters[$type];

$pdo = Database::getConnection();
try {
    $pdo->beginTransaction();
    $user = Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE', [$userId]);
    if (!$user) throw new RuntimeException('User not found');
    if ($type === 'red_envelope') {
        // Red packet rain: fixed rounds, one packet per member per round, first 50 members only
        $round = bbPacketWindow();
        if (!$round) throw new RuntimeException('রেড প্যাকেট বৃষ্টি চলে শুধু ' . bbPacketHoursText() . '।');
        $taken = Database::fetchOne('SELECT COUNT(*) AS c FROM reward_grants WHERE grant_key = ? FOR UPDATE', ['packet:' . $round]);
        if ((int)$taken['c'] >= bbPacketLimit()) throw new RuntimeException('এই রাউন্ডের সব রেড প্যাকেট শেষ। পরের রাউন্ডে চেষ্টা করুন।');
        if (!bbGrantOnce($userId, 'packet:' . $round)) throw new RuntimeException('এই রাউন্ডের রেড প্যাকেট আপনি ইতিমধ্যে নিয়েছেন।');
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?', [$amount, $userId]);
    } else {
        if ((int)$user[$col] <= 0) throw new RuntimeException('আপনার কোনো সুযোগ বাকি নেই।');
        Database::execute("UPDATE users SET `$col`=`$col`-1, balance=balance+? WHERE id=?", [$amount, $userId]);
    }
    if ($amount > 0) Database::insert('transactions', [
        'id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $userId, 'username' => $user['username'],
        'user_phone' => $user['phone'], 'type' => 'bonus', 'amount' => $amount, 'channel' => 'system',
        'trx_id' => 'REW' . date('YmdHis') . random_int(100, 999), 'status' => 'success',
        'description' => "{$label} ({$type}) সার্ভার পুরস্কার", 'created_at' => date('Y-m-d H:i:s'),
    ]);
    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'Reward could not be processed', 400);
}
$u = Database::fetchOne('SELECT * FROM users WHERE id=?', [$userId]);
unset($u['password_hash'], $u['transaction_password']);
Database::jsonResponse(['success' => true, 'prize' => ['index' => $index, 'label' => $label, 'amount' => $amount], 'newBalance' => (float)$u['balance'], 'user' => $u]);
