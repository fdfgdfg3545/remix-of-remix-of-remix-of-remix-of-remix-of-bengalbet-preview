<?php
/**
 * BengalBet Administration REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/reward_grants.php';
require_once __DIR__ . '/turnover_math.php';
require_once __DIR__.'/withdraw_activation.php';

Database::requireAdmin();
$method = $_SERVER['REQUEST_METHOD'];
$section = $_GET['section'] ?? '';
$action = $_GET['action'] ?? '';
$targetId = $_GET['id'] ?? '';
$input = Database::getJsonInput();
if ($section === 'cron') {
    require __DIR__ . '/cron_admin.php';
    exit();
}
// Admin banner upload: base64 PNG/JPG/WEBP up to 2 MB, saved with a random name, returns a public https URL.
if ($section === 'upload-image') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') Database::errorResponse('Method Not Allowed', 405);
    if (!preg_match('#^data:image/(png|jpe?g|webp);base64,(.+)$#s', (string)($input['dataUrl'] ?? ''), $m)) Database::errorResponse('শুধু PNG, JPG বা WEBP ছবি দিন।', 400);
    $bin = base64_decode($m[2], true);
    if ($bin === false || strlen($bin) > 2 * 1024 * 1024) Database::errorResponse('ছবি সর্বোচ্চ ২ MB হতে পারে।', 400);
    $info = @getimagesizefromstring($bin);
    if (!$info || !in_array($info[2], [IMAGETYPE_PNG, IMAGETYPE_JPEG, IMAGETYPE_WEBP], true)) Database::errorResponse('ছবিটি ঠিক নয়।', 400);
    $ext = [IMAGETYPE_PNG => 'png', IMAGETYPE_JPEG => 'jpg', IMAGETYPE_WEBP => 'webp'][$info[2]];
    $dir = __DIR__ . '/../uploads/promo';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $name = date('Ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (file_put_contents("$dir/$name", $bin) === false) Database::errorResponse('ছবি সংরক্ষণ হয়নি।', 500);
    $base = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'server.nexarofx.com') . preg_replace('#/api/.*$#', '', $_SERVER['SCRIPT_NAME'] ?? '/dbserver/api/admin.php');
    Database::jsonResponse(['success' => true, 'url' => "$base/uploads/promo/$name", 'width' => $info[0], 'height' => $info[1]]);
}
if (in_array($section, ['daily-signin','vip','rescue','promos','mystery-reward','chance-rewards','deposit-offer','promo-rules','promo-content'], true)) {
    require __DIR__ . '/admin_rewards.php';
    exit();
}


// Credit an approved deposit (amount + bonus, VIP exp, referral commission) exactly once
function bbApproveDeposit(array $tx): void {
    if ($tx['type'] !== 'deposit' || $tx['status'] === 'success') return;
    $amount = (float)$tx['amount']; $bonus = (float)($tx['bonus'] ?? 0);
    $locked=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$tx['user_id']]);
    if(!$locked)throw new RuntimeException('User not found');
    bbActivationApprove($locked,$amount);
    // First approved deposit becomes eligible before its own grants inside this transaction.
    Database::update('transactions',['status'=>'success','processed_at'=>date('Y-m-d H:i:s')],'id=?',[$tx['id']]);
    Database::execute("UPDATE `users` SET `balance` = `balance` + ?, `vip_exp` = `vip_exp` + ? WHERE `id` = ?", [$amount + $bonus, (int)$amount, $tx['user_id']]);
    bbDepositGrants($tx['user_id'], $amount);
    require_once __DIR__ . '/vip_progress.php';
    $ref = Database::fetchOne("SELECT * FROM `referrals` WHERE `referred_user_id` = ?", [$tx['user_id']]);
    if ($ref) {
        $rs = bbReferralSettings();
        Database::fetchOne('SELECT id FROM users WHERE id=? FOR UPDATE',[$ref['referrer_id']]);
        $c = !empty($rs['enabled']) && bbHasLifetimeDeposit($ref['referrer_id']) ? round($amount * (float)$rs['depositRebateRate'] / 100, 2) : 0.0;
        Database::update('referrals', [
            'total_deposit' => (float)$ref['total_deposit'] + $amount,
            'deposit_commission' => (float)$ref['deposit_commission'] + $c,
            'total_commission_earned' => (float)$ref['total_commission_earned'] + $c
        ], "`id` = ?", [$ref['id']]);
        Database::execute("UPDATE `users` SET `balance` = `balance` + ?, `total_earnings` = `total_earnings` + ? WHERE `id` = ?", [$c, $c, $ref['referrer_id']]);
        bbLogReferralCommission($ref['referrer_id'], $c, "রেফারেল জমা কমিশন: {$ref['referred_username']}");
        bbReferralQualify($tx['user_id']);
    }
    // deposit row is marked success by the caller; count this amount now
    bbVipSyncWithPending($tx['user_id'], $amount, (string)$tx['id']);
}
function bbRefundWithdraw(array $tx, string $status): void {
    if ($tx['type'] === 'withdraw' && $status === 'rejected' && $tx['status'] !== 'rejected') {
        Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [(float)$tx['amount'], $tx['user_id']]);
    }
}

require __DIR__.'/ledger_mutation_guard.php';
require __DIR__.'/money_guard.php';
switch ($section) {
    // ------------------------------------------------------------------------
    // DASHBOARD OVERVIEW STATS
    // ------------------------------------------------------------------------
    case 'stats':
        $usersCount = Database::fetchOne("SELECT COUNT(*) as cnt, SUM(`balance`) as totalBal FROM `users`");
        $depStats = Database::fetchOne("SELECT SUM(`amount`) as totalDep FROM `transactions` WHERE `type` = 'deposit' AND `status` = 'success'");
        $wdStats = Database::fetchOne("SELECT SUM(`amount`) as totalWd FROM `transactions` WHERE `type` = 'withdraw' AND `status` = 'success'");
        $pendingDep = Database::fetchOne("SELECT COUNT(*) as cnt FROM `transactions` WHERE `type` = 'deposit' AND `status` = 'pending'");
        $pendingWd = Database::fetchOne("SELECT COUNT(*) as cnt FROM `transactions` WHERE `type` = 'withdraw' AND `status` = 'pending'");
        $totalTx = Database::fetchOne("SELECT COUNT(*) as cnt FROM `transactions`");
        $fbStats = Database::fetchOne("SELECT COUNT(*) as cnt FROM `feedbacks`");
        $pendingFb = Database::fetchOne("SELECT COUNT(*) as cnt FROM `feedbacks` WHERE `status` = 'pending'");
        $settings = Database::fetchOne("SELECT `maintenance_mode` FROM `site_settings` WHERE `id` = 1");

        $waitingChat = Database::fetchOne("SELECT COUNT(*) as cnt FROM `chat_sessions` WHERE `status` = 'waiting'");

        $totalDeposit = (float)($depStats['totalDep'] ?? 0);
        $totalWithdraw = (float)($wdStats['totalWd'] ?? 0);
        $netGgr = $totalDeposit - $totalWithdraw;

        Database::jsonResponse([
            'success' => true,
            'stats' => [
                'totalUsers' => (int)($usersCount['cnt'] ?? 0),
                'totalUserBalance' => (float)($usersCount['totalBal'] ?? 0),
                'totalDepositAmount' => $totalDeposit,
                'totalWithdrawAmount' => $totalWithdraw,
                'netGGR' => $netGgr,
                'pendingDepositsCount' => (int)($pendingDep['cnt'] ?? 0),
                'pendingWithdrawalsCount' => (int)($pendingWd['cnt'] ?? 0),
                'totalTransactionsCount' => (int)($totalTx['cnt'] ?? 0),
                'totalFeedbacksCount' => (int)($fbStats['cnt'] ?? 0),
                'pendingFeedbacksCount' => (int)($pendingFb['cnt'] ?? 0),
                'maintenanceMode' => (bool)($settings['maintenance_mode'] ?? 0),
                'serverTime' => date('Y-m-d H:i:s'),
                'liveChatStats' => [
                    'waitingSessions' => (int)($waitingChat['cnt'] ?? 0),
                    'unreadAdminCount' => (int)($waitingChat['cnt'] ?? 0)
                ]
            ]
        ]);
        break;

    // ------------------------------------------------------------------------
    // USER MANAGEMENT
    // ------------------------------------------------------------------------
    case 'users':
        if ($method === 'GET' && empty($action)) {
            $users = Database::fetchAll("SELECT * FROM `users` ORDER BY `created_at` DESC LIMIT 200");
            foreach ($users as &$u) {
                unset($u['password_hash'], $u['transaction_password']);
            }
            Database::jsonResponse([
                'success' => true,
                'count' => count($users),
                'users' => $users
            ]);
        } elseif ($action === 'create' || ($method === 'POST' && empty($action))) {
            $username = trim($input['username'] ?? '');
            $phone = trim($input['phone'] ?? '');
            $email = trim($input['email'] ?? '');
            $password = trim($input['password'] ?? '123456');
            $balance = 0.0;
            $vipLevel = (int)($input['vipLevel'] ?? 0);
            $realName = trim($input['realName'] ?? '');

            if (empty($phone) || empty($username)) {
                Database::errorResponse('ইউজারনেম এবং ফোন নম্বর আবশ্যক।', 400);
            }

            $userId = 'usr-' . substr(md5(uniqid($phone, true)), 0, 10);
            $newUser = [
                'id' => $userId,
                'username' => $username,
                'phone' => $phone,
                'email' => $email ?: null,
                'password_hash' => password_hash($password, PASSWORD_BCRYPT),
                'balance' => $balance,
                'vip_level' => $vipLevel,
                'vip_exp' => $vipLevel * 1000,
                'vip_max_exp' => ($vipLevel + 1) * 2000,
                'free_spins' => 0,
                'red_packets_available' => 0,
                'golden_eggs_available' => 0,
                'unread_notifications' => 1,
                'referral_code' => 'BDT' . strtoupper(substr(uniqid(), -4)),
                'total_earnings' => 0.00,
                'referred_friends_count' => 0,
                'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                'real_name' => $realName ?: null,
                'status' => 'active',
                'created_at' => date('Y-m-d H:i:s')
            ];

            Database::insert('users', $newUser);
            unset($newUser['password_hash']);

            Database::jsonResponse([
                'success' => true,
                'message' => 'ব্যবহারকারী সফলভাবে তৈরি হয়েছে!',
                'user' => $newUser
            ]);
        } elseif ($action === 'sync') {
            $syncList = $input['users'] ?? [];
            $count = 0;
            if (is_array($syncList)) {
                foreach ($syncList as $u) {
                    $uId = $u['id'] ?? '';
                    if (empty($uId)) continue;
                    $exists = Database::fetchOne("SELECT `id` FROM `users` WHERE `id` = ?", [$uId]);
                    if (!$exists) {
                        $phone = $u['phone'] ?? ('01' . rand(300000000, 999999999));
                        Database::insert('users', [
                            'id' => $uId,
                            'username' => $u['username'] ?? 'User',
                            'phone' => $phone,
                            'email' => $u['email'] ?? null,
                            'balance' => 0.0,
                            'vip_level' => (int)($u['vipLevel'] ?? 1),
                            'vip_exp' => 100,
                            'vip_max_exp' => 2000,
                            'avatar' => $u['avatar'] ?? null,
                            'status' => 'active',
                            'created_at' => date('Y-m-d H:i:s')
                        ]);
                        $count++;
                    }
                }
            }
            Database::jsonResponse(['success' => true, 'syncedCount' => $count, 'total' => count($syncList)]);
        } elseif ($action === 'details') {
            $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$targetId]);
            if (!$user) Database::errorResponse('User not found', 404);
            unset($user['password_hash'], $user['transaction_password']);
            Database::jsonResponse(['success' => true, 'details' => $user]);
        } elseif ($action === 'update') {
            if(array_key_exists('balance',$input)) Database::errorResponse('Use the audited balance adjustment action',422);
            unset($input['id'], $input['password_hash']);
            Database::update('users', $input, "`id` = ?", [$targetId]);
            $updated = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$targetId]);
            unset($updated['password_hash'], $updated['transaction_password']);
            Database::jsonResponse(['success' => true, 'message' => 'User updated', 'user' => $updated]);
        } elseif ($action === 'status') {
            $status = $input['status'] ?? 'active';
            Database::update('users', ['status' => $status], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => "User status set to {$status}"]);
        } elseif ($action === 'balance') {
            $amount = (float)($input['amount'] ?? 0);
            $type = $input['type'] ?? 'add';
            $note = $input['note'] ?? 'অ্যাডমিন ব্যালেন্স সমন্বয়';

            $pdo=Database::getConnection();
            try {
            $pdo->beginTransaction();
            $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ? FOR UPDATE", [$targetId]);
            if (!$user) throw new RuntimeException('User not found');
            $change=bbBalanceAdjustment((float)$user['balance'],$amount,$type);
            $newBal=$change['balance'];
            if($change['type']==='bonus')bbRequireBonusDeposit($targetId);
            bbActivationCheck($user);
            Database::update('users', ['balance' => $newBal], "`id` = ?", [$targetId]);

            // Transaction log
            Database::insert('transactions', [
                'id' => 'tx-' . uniqid(),
                'user_id' => $targetId,
                'username' => $user['username'],
                'user_phone' => $user['phone'],
                'type' => $change['type'],
                'amount' => $change['amount'],
                'channel' => 'system',
                'trx_id' => 'ADM' . date('YmdHis') . rand(100, 999),
                'status' => 'success',
                'description' => "অ্যাডমিন সমন্বয়: {$note}",
                'created_at' => date('Y-m-d H:i:s')
            ]);

            $pdo->commit();
            } catch(Throwable $e) {if($pdo->inTransaction())$pdo->rollBack(); Database::errorResponse('Balance adjustment failed',400);}
            Database::jsonResponse(['success' => true, 'message' => 'ব্যালেন্স সফলভাবে আপডেট হয়েছে', 'newBalance' => $newBal]);
        } elseif ($action === 'vip') {
            $level = (int)($input['vipLevel'] ?? 1);
            $exp = (int)($input['vipExp'] ?? ($level * 1000));
            Database::update('users', ['vip_level' => $level, 'vip_exp' => $exp], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'VIP লেভেল সফলভাবে আপডেট হয়েছে']);
        } elseif ($action === 'message') {
            $title = trim($input['title'] ?? 'অ্যাডমিন নোটিশ');
            $msgId = 'msg-' . uniqid();
            Database::insert('messages', [
                'id' => $msgId, 'user_id' => $targetId,
                'sender' => trim($input['sender'] ?? 'বেঙ্গলবেট অফিশিয়াল'),
                'title' => $title, 'display_time' => date('h:i A'), 'date_full' => date('Y-m-d'),
                'is_read' => 0, 'category' => 'notice',
                'content_json' => json_encode(['headline' => $title, 'description' => $input['description'] ?? ''], JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s')
            ]);
            Database::jsonResponse(['success' => true, 'message' => 'মেসেজ পাঠানো হয়েছে', 'record' => ['id' => $msgId]]);
        } elseif ($action === 'reset-cooldowns') {
            $u = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$targetId]);
            if (!$u) Database::errorResponse('User not found', 404);
            if(!bbHasLifetimeDeposit($uid))Database::errorResponse('বোনাস পেতে আগে একটি জমা অনুমোদিত হতে হবে।',400);
            Database::update('users', ['free_spins' => max(5, (int)$u['free_spins']), 'red_packets_available' => max(3, (int)$u['red_packets_available']), 'golden_eggs_available' => max(1, (int)$u['golden_eggs_available'])], "`id` = ?", [$targetId]);
            $u = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$targetId]);
            unset($u['password_hash'], $u['transaction_password']);
            Database::jsonResponse(['success' => true, 'message' => 'কুলডাউন রিসেট হয়েছে', 'user' => $u]);
        } elseif ($action === 'delete') {
            Database::delete('users', "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে']);
        }
        break;

    // ------------------------------------------------------------------------
    // TRANSACTIONS MANAGEMENT
    // ------------------------------------------------------------------------
    case 'transactions':
        if ($method === 'GET' && empty($action)) {
            $type = $_GET['type'] ?? '';
            $status = $_GET['status'] ?? '';
            $channel = $_GET['channel'] ?? '';
            $search = $_GET['search'] ?? '';

            $sql = "SELECT * FROM `transactions` WHERE 1=1";
            $params = [];

            if (!empty($type) && $type !== 'all') {
                $sql .= " AND `type` = ?";
                $params[] = $type;
            }
            if (!empty($status) && $status !== 'all') {
                $sql .= " AND `status` = ?";
                $params[] = $status;
            }
            if (!empty($channel) && $channel !== 'all') {
                $sql .= " AND `channel` = ?";
                $params[] = $channel;
            }
            if (!empty($search)) {
                $sql .= " AND (`trx_id` LIKE ? OR `username` LIKE ? OR `account_number` LIKE ?)";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
                $params[] = "%{$search}%";
            }

            $sql .= " ORDER BY `created_at` DESC LIMIT 200";
            $txList = Database::fetchAll($sql, $params);

            Database::jsonResponse([
                'success' => true,
                'count' => count($txList),
                'transactions' => $txList
            ]);
        } elseif ($action === 'create') {
            $userId = trim($input['userId'] ?? '');
            $type = trim($input['type'] ?? 'deposit');
            $amount = (float)($input['amount'] ?? 0);
            $channel = trim($input['channel'] ?? 'bkash');
            $status = trim($input['status'] ?? 'success');
            $adminNote = trim($input['adminNote'] ?? 'অ্যাডমিন ম্যানুয়াল তৈরি');

            $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
            $username = $user ? $user['username'] : 'User';
            $phone = $user ? $user['phone'] : '';

            $txId = 'tx-' . uniqid();
            $trxCode = trim($input['trxId'] ?? ('MAN' . date('YmdHis') . rand(100, 999)));

            Database::insert('transactions', [
                'id' => $txId,
                'user_id' => $userId,
                'username' => $username,
                'user_phone' => $phone,
                'type' => $type,
                'amount' => $amount,
                'channel' => $channel,
                'trx_id' => $trxCode,
                'status' => $status,
                'admin_note' => $adminNote,
                'description' => $input['description'] ?? "অ্যাডমিন তৈরি: {$type}",
                'created_at' => date('Y-m-d H:i:s')
            ]);

            if ($status === 'success' && !empty($input['adjustBalance'])) {
                if ($type === 'deposit') {
                    Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$amount, $userId]);
                } elseif ($type === 'withdraw') {
                    Database::execute("UPDATE `users` SET `balance` = GREATEST(0, `balance` - ?) WHERE `id` = ?", [$amount, $userId]);
                }
            }

            Database::jsonResponse(['success' => true, 'message' => 'লেনদেন সফলভাবে তৈরি করা হয়েছে!']);
        } elseif ($action === 'status') {
            $status = $input['status'] ?? 'success';
            $adminNote = $input['adminNote'] ?? '';
            $reason = $input['rejectionReason'] ?? '';

            $tx = Database::fetchOne("SELECT * FROM `transactions` WHERE `id` = ?", [$targetId]);
            if (!$tx) Database::errorResponse('Transaction not found', 404);

            Database::update('transactions', [
                'status' => $status,
                'admin_note' => $adminNote ?: $tx['admin_note'],
                'rejection_reason' => $reason ?: $tx['rejection_reason'],
                'processed_at' => date('Y-m-d H:i:s'),
                'processed_by' => 'Admin'
            ], "`id` = ?", [$targetId]);

            if ($status === 'success') bbApproveDeposit($tx);
            bbRefundWithdraw($tx, $status);

            Database::jsonResponse(['success' => true, 'message' => "লেনদেন স্ট্যাটাস পরিবর্তিত হয়েছে: {$status}"]);
        } elseif ($action === 'batch') {
            $ids = $input['ids'] ?? [];
            $status = $input['status'] ?? 'success';
            $count = 0;
            if (is_array($ids)) {
                foreach ($ids as $id) {
                    $btx = Database::fetchOne("SELECT * FROM `transactions` WHERE `id` = ?", [$id]);
                    if (!$btx) continue;
                    if ($status === 'success') bbApproveDeposit($btx);
                    bbRefundWithdraw($btx, $status);
                    Database::update('transactions', ['status' => $status, 'processed_at' => date('Y-m-d H:i:s')], "`id` = ?", [$id]);
                    $count++;
                }
            }
            Database::jsonResponse(['success' => true, 'updatedCount' => $count, 'message' => "{$count} টি লেনদেন আপডেট হয়েছে!"]);
        } elseif ($action === 'edit' || $action === 'update') {
            $allowed = ['amount','bonus','fee','admin_note','description','account_number','trx_id','channel','gateway'];
            $map = ['adminNote' => 'admin_note', 'accountNumber' => 'account_number', 'trxId' => 'trx_id'];
            $upd = [];
            foreach ($input as $k => $v) { $col = $map[$k] ?? $k; if (in_array($col, $allowed, true)) $upd[$col] = $v; }
            if ($upd) Database::update('transactions', $upd, "`id` = ?", [$targetId]);
            $tx = Database::fetchOne("SELECT * FROM `transactions` WHERE `id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'লেনদেন আপডেট হয়েছে', 'transaction' => $tx]);
        } elseif ($action === 'delete') {
            Database::delete('transactions', "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'লেনদেন মুছে ফেলা হয়েছে']);
        }
        break;

    // ------------------------------------------------------------------------
    // SITE SETTINGS MANAGEMENT
    // ------------------------------------------------------------------------
    case 'settings':
        if ($method === 'GET') {
            $settings = Database::fetchOne("SELECT * FROM `site_settings` WHERE `id` = 1");
            $siteNotice = json_decode($settings['site_notice_json'] ?? '{}', true) ?: [];
            $gameRtp = json_decode($settings['game_rtp_json'] ?? '{}', true) ?: [];
            $gameEngine = json_decode($settings['game_engine_json'] ?? '{}', true) ?: [];

            Database::jsonResponse([
                'success' => true,
                'settings' => [
                    'bkashNumber' => $settings['bkash_number'],
                    'nagadNumber' => $settings['nagad_number'],
                    'rocketNumber' => $settings['rocket_number'],
                    'usdtAddress' => $settings['usdt_address'],
                    'minDeposit' => (float)$settings['min_deposit'],
                    'maxDeposit' => (float)$settings['max_deposit'],
                    'minWithdraw' => (float)$settings['min_withdraw'],
                    'maxWithdraw' => (float)$settings['max_withdraw'],
                    'siteNotice' => $siteNotice,
                    'gameRtp' => $gameRtp,
                    'gameEngine' => $gameEngine,
                    'maintenanceMode' => (bool)$settings['maintenance_mode']
                ]
            ]);
        } elseif ($method === 'POST') {
            $updates = [];
            if (isset($input['bkashNumber'])) $updates['bkash_number'] = $input['bkashNumber'];
            if (isset($input['nagadNumber'])) $updates['nagad_number'] = $input['nagadNumber'];
            if (isset($input['rocketNumber'])) $updates['rocket_number'] = $input['rocketNumber'];
            if (isset($input['usdtAddress'])) $updates['usdt_address'] = $input['usdtAddress'];
            if (isset($input['minDeposit'])) $updates['min_deposit'] = (float)$input['minDeposit'];
            if (isset($input['maxDeposit'])) $updates['max_deposit'] = (float)$input['maxDeposit'];
            if (isset($input['minWithdraw'])) $updates['min_withdraw'] = (float)$input['minWithdraw'];
            if (isset($input['maxWithdraw'])) $updates['max_withdraw'] = (float)$input['maxWithdraw'];
            if (isset($input['siteNotice'])) $updates['site_notice_json'] = json_encode($input['siteNotice'], JSON_UNESCAPED_UNICODE);
            if (isset($input['gameRtp'])) $updates['game_rtp_json'] = json_encode($input['gameRtp']);
            if (isset($input['gameEngine'])) $updates['game_engine_json'] = json_encode($input['gameEngine']);
            if (isset($input['maintenanceMode'])) $updates['maintenance_mode'] = $input['maintenanceMode'] ? 1 : 0;

            Database::update('site_settings', $updates, "`id` = 1");
            Database::jsonResponse(['success' => true, 'message' => 'সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে!']);
        }
        break;

    // ------------------------------------------------------------------------
    // FEEDBACKS / SUPPORT TICKETS
    // ------------------------------------------------------------------------
    case 'feedbacks':
        if ($method === 'GET') {
            $feedbacks = Database::fetchAll("SELECT * FROM `feedbacks` ORDER BY `created_at` DESC LIMIT 100");
            Database::jsonResponse(['success' => true, 'feedbacks' => $feedbacks]);
        } elseif ($action === 'reply') {
            $reply = trim($input['reply'] ?? '');
            $status = $input['status'] ?? 'replied';
            $senderName = $input['senderName'] ?? 'সাপোর্ট টিম';

            Database::update('feedbacks', [
                'reply' => $reply,
                'status' => $status,
                'updated_at' => date('Y-m-d H:i:s')
            ], "`id` = ?", [$targetId]);

            Database::insert('feedback_messages', [
                'id' => 'fbm-' . uniqid(),
                'feedback_id' => $targetId,
                'sender' => 'admin',
                'sender_name' => $senderName,
                'text' => $reply,
                'created_at' => date('Y-m-d H:i:s')
            ]);

            Database::jsonResponse(['success' => true, 'message' => 'উত্তর প্রদান করা হয়েছে!']);
        } elseif ($action === 'status') {
            Database::update('feedbacks', ['status' => trim($input['status'] ?? 'resolved')], "`id` = ?", [$targetId]);
            $fb = Database::fetchOne("SELECT * FROM `feedbacks` WHERE `id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'স্ট্যাটাস আপডেট হয়েছে', 'feedback' => $fb]);
        } elseif ($action === 'delete') {
            Database::delete('feedbacks', "`id` = ?", [$targetId]);
            Database::delete('feedback_messages', "`feedback_id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'টিকেট মুছে ফেলা হয়েছে']);
        }
        break;

    // ------------------------------------------------------------------------
    // BROADCAST MESSAGES
    // ------------------------------------------------------------------------
    case 'messages':
        if ($method === 'GET') {
            $messages = Database::fetchAll("SELECT * FROM `messages` ORDER BY `created_at` DESC LIMIT 100");
            Database::jsonResponse(['success' => true, 'messages' => $messages]);
        } elseif ($action === 'create') {
            $title = trim($input['title'] ?? '');
            $headline = trim($input['headline'] ?? $title);
            $sender = trim($input['sender'] ?? 'বেঙ্গলবেট অফিশিয়াল');
            $bonus = (float)($input['claimableBonus'] ?? 0);
            $userId = trim($input['userId'] ?? 'all');

            $msgId = 'msg-' . uniqid();
            $content = [
                'headline' => $headline,
                'description' => $input['description'] ?? '',
                'howToGetTitle' => 'পুরস্কার গ্রহণের নিয়ম:',
                'howToGetSteps' => $input['steps'] ?? ['ইনবক্সে বোনাস বাটনে ক্লিক করুন।'],
                'rulesTitle' => 'নিয়মাবলী:',
                'rules' => $input['rules'] ?? ['১ জন ব্যবহারকারী ১ বার গ্রহণ করতে পারবেন।']
            ];

            Database::insert('messages', [
                'id' => $msgId,
                'user_id' => $userId,
                'sender' => $sender,
                'title' => $title,
                'display_time' => date('h:i A'),
                'date_full' => date('Y-m-d'),
                'is_read' => 0,
                'category' => $input['category'] ?? 'notice',
                'claimable_bonus' => $bonus,
                'content_json' => json_encode($content, JSON_UNESCAPED_UNICODE),
                'created_at' => date('Y-m-d H:i:s')
            ]);

            Database::jsonResponse(['success' => true, 'message' => 'ব্রডকাস্ট নোটিশ সফলভাবে তৈরি ও পাঠানো হয়েছে!']);
        } elseif ($action === 'delete') {
            Database::delete('messages', "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'নোটিশ মুছে ফেলা হয়েছে']);
        }
        break;

    // ------------------------------------------------------------------------
    // LIVE CHAT ADMIN
    // ------------------------------------------------------------------------
    case 'chat':
        if ($action === 'sessions') {
            $sessions = Database::fetchAll("SELECT * FROM `chat_sessions` ORDER BY `last_message_at` DESC LIMIT 50");
            Database::jsonResponse([
                'success' => true,
                'sessions' => $sessions,
                'stats' => [
                    'totalSessions' => count($sessions),
                    'activeSessions' => count(array_filter($sessions, fn($s) => $s['status'] === 'active')),
                    'waitingSessions' => count(array_filter($sessions, fn($s) => $s['status'] === 'waiting')),
                    'resolvedSessions' => count(array_filter($sessions, fn($s) => $s['status'] === 'resolved')),
                    'unreadAdminCount' => array_sum(array_column($sessions, 'unread_admin_count')),
                    'avgRating' => 4.9
                ]
            ]);
        } elseif ($action === 'session') {
            $s = Database::fetchOne("SELECT * FROM `chat_sessions` WHERE `id` = ?", [$targetId]);
            if (!$s) Database::errorResponse('Session not found', 404);
            $msgs = Database::fetchAll("SELECT * FROM `chat_messages` WHERE `session_id` = ? ORDER BY `created_at` ASC", [$targetId]);
            Database::update('chat_sessions', ['unread_admin_count' => 0], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'session' => $s, 'messages' => $msgs]);
        } elseif ($action === 'status') {
            Database::update('chat_sessions', ['status' => trim($input['status'] ?? 'resolved')], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'স্ট্যাটাস আপডেট হয়েছে', 'session' => Database::fetchOne("SELECT * FROM `chat_sessions` WHERE `id` = ?", [$targetId])]);
        } elseif ($action === 'assign') {
            Database::update('chat_sessions', ['assigned_agent_name' => $input['name'] ?? '', 'assigned_agent_role' => $input['role'] ?? null, 'assigned_agent_avatar' => $input['avatar'] ?? null], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'session' => Database::fetchOne("SELECT * FROM `chat_sessions` WHERE `id` = ?", [$targetId])]);
        } elseif ($action === 'note') {
            Database::update('chat_sessions', ['internal_note' => $input['note'] ?? ''], "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'নোট সংরক্ষিত', 'session' => Database::fetchOne("SELECT * FROM `chat_sessions` WHERE `id` = ?", [$targetId])]);
        } elseif ($action === 'delete') {
            Database::delete('chat_messages', "`session_id` = ?", [$targetId]);
            Database::delete('chat_sessions', "`id` = ?", [$targetId]);
            Database::jsonResponse(['success' => true, 'message' => 'সেশন মুছে ফেলা হয়েছে']);
        } elseif ($action === 'reply') {
            $sessionId = $targetId;
            $text = trim($input['text'] ?? '');
            $senderName = $input['senderName'] ?? 'অ্যাডমিন ম্যানেজার';

            $msgId = 'cmsg-' . uniqid();
            Database::insert('chat_messages', [
                'id' => $msgId,
                'session_id' => $sessionId,
                'sender' => 'agent',
                'sender_name' => $senderName,
                'text' => $text,
                'is_read' => 0,
                'created_at' => date('Y-m-d H:i:s')
            ]);

            Database::update('chat_sessions', [
                'last_message' => $text,
                'last_message_at' => date('Y-m-d H:i:s'),
                'unread_admin_count' => 0,
                'status' => 'active'
            ], "`id` = ?", [$sessionId]);

            Database::jsonResponse(['success' => true, 'message' => 'Reply sent']);
        } elseif ($action === 'credit') {
            $sessionId = $targetId;
            $amount = (float)($input['amount'] ?? 0);
            $note = $input['note'] ?? 'লাইভ চ্যাট বোনাস ক্রেডিট';

            $session = Database::fetchOne("SELECT `user_id` FROM `chat_sessions` WHERE `id` = ?", [$sessionId]);
            if ($session && $amount > 0) {
                if(!bbHasLifetimeDeposit($session['user_id']))Database::errorResponse('বোনাস পেতে আগে একটি জমা অনুমোদিত হতে হবে।',400);
                Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$amount, $session['user_id']]);
                
                Database::insert('transactions', [
                    'id' => 'tx-' . uniqid(),
                    'user_id' => $session['user_id'],
                    'type' => 'bonus',
                    'amount' => $amount,
                    'channel' => 'system',
                    'trx_id' => 'CHAT' . date('YmdHis'),
                    'status' => 'success',
                    'description' => $note,
                    'created_at' => date('Y-m-d H:i:s')
                ]);
            }
            Database::jsonResponse(['success' => true, 'message' => "৳{$amount} সফলভাবে অ্যাকাউন্টে জমা করা হয়েছে!"]);
        }
        break;

    // ------------------------------------------------------------------------
    // REFERRALS ADMIN
    // ------------------------------------------------------------------------
    case 'referrals':
        if ($action === 'stats') {
            $totalRefs = Database::fetchOne("SELECT COUNT(*) as cnt, SUM(`deposit_commission`) as depComm, SUM(`bet_commission`) as betComm FROM `referrals`");
            $topReferrers = Database::fetchAll("SELECT `id` as userId, `username`, `phone`, `referral_code` as code, `referred_friends_count` as friendsCount, `total_earnings` as totalEarnings FROM `users` WHERE `referred_friends_count` > 0 ORDER BY `total_earnings` DESC LIMIT 10");

            Database::jsonResponse([
                'success' => true,
                'stats' => [
                    'totalReferrals' => (int)($totalRefs['cnt'] ?? 0),
                    'totalBonusPaid' => round((float)($totalRefs['depComm'] ?? 0) + (float)($totalRefs['betComm'] ?? 0), 2),
                    'activeReferrers' => count($topReferrers),
                    'totalDepositsGenerated' => 125000,
                    'totalTurnoverGenerated' => 950000,
                    'instantBonusPerFriend' => 300,
                    'depositCommissionRate' => 0.70,
                    'betRebateRate' => 1.00
                ],
                'topReferrers' => $topReferrers
            ]);
        } elseif ($action === 'list') {
            $list = Database::fetchAll("SELECT * FROM `referrals` ORDER BY `joined_at` DESC LIMIT 100");
            Database::jsonResponse(['success' => true, 'referrals' => $list, 'total' => count($list)]);
        } elseif ($action === 'settings') {
            $file = __DIR__ . '/../data/referral_settings.json';
            $cur = file_exists($file) ? (json_decode(file_get_contents($file), true) ?: []) : [];
            $cur = array_merge($cur, bbReferralSettings());
            if ($method === 'POST') {
                foreach (['instantBonusPerFriend','minDepositToQualify','minBetTurnoverToQualify','depositRebateRate','betTurnoverRebateRate','maxBonusCap'] as $k) if (isset($input[$k]) && (!is_numeric($input[$k]) || $input[$k] < 0 || $input[$k] > 100000000)) Database::errorResponse("Invalid $k", 422);
                foreach (['depositRebateRate','betTurnoverRebateRate'] as $k) if (isset($input[$k]) && $input[$k] > 100) Database::errorResponse("Invalid $k", 422);
                $cur = array_merge($cur, $input);
                if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
                file_put_contents($file, json_encode($cur, JSON_UNESCAPED_UNICODE));
                Database::jsonResponse(['success' => true, 'message' => 'রেফার সেটিংস সংরক্ষিত', 'settings' => $cur]);
            }
            Database::jsonResponse(['success' => true, 'settings' => $cur]);
        } elseif ($action === 'bonus-payout') {
            $uid = trim($input['userId'] ?? ''); $amt = (float)($input['amount'] ?? 0);
            if ($uid === '' || $amt <= 0) Database::errorResponse('ব্যবহারকারী ও পরিমাণ দিন', 400);
            $u = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$uid]);
            if (!$u) Database::errorResponse('User not found', 404);
            if(!bbHasLifetimeDeposit($uid))Database::errorResponse('বোনাস পেতে আগে একটি জমা অনুমোদিত হতে হবে।',400);
            Database::execute("UPDATE `users` SET `balance` = `balance` + ?, `total_earnings` = `total_earnings` + ? WHERE `id` = ?", [$amt, $amt, $uid]);
            $tx = ['id' => 'tx-' . uniqid(), 'user_id' => $uid, 'username' => $u['username'], 'user_phone' => $u['phone'], 'type' => 'bonus', 'amount' => $amt, 'channel' => 'system', 'trx_id' => 'REF' . date('YmdHis') . rand(100,999), 'status' => 'success', 'description' => $input['note'] ?? 'রেফার বোনাস (অ্যাডমিন)', 'created_at' => date('Y-m-d H:i:s')];
            Database::insert('transactions', $tx);
            Database::jsonResponse(['success' => true, 'message' => "৳{$amt} রেফার বোনাস দেওয়া হয়েছে", 'newBalance' => (float)$u['balance'] + $amt, 'transaction' => $tx]);
        } elseif ($action === 'status') {
            Database::update('referrals', ['status' => trim($input['status'] ?? 'active')], "`id` = ?", [trim($input['id'] ?? $targetId)]);
            Database::jsonResponse(['success' => true, 'message' => 'স্ট্যাটাস আপডেট হয়েছে', 'referral' => Database::fetchOne("SELECT * FROM `referrals` WHERE `id` = ?", [trim($input['id'] ?? $targetId)])]);
        } elseif ($action === 'claims') {
            $rows = Database::fetchAll("SELECT c.*, u.username, u.phone FROM `referral_claims` c LEFT JOIN `users` u ON u.id = c.user_id ORDER BY c.claimed_at DESC LIMIT 200");
            $claims = array_map(fn($r) => ['id' => $r['id'], 'userId' => $r['user_id'], 'username' => $r['username'], 'phone' => $r['phone'], 'tierId' => (int)$r['tier_id'], 'requiredCount' => (int)$r['required_count'], 'bonusAmount' => (float)$r['bonus_amount'], 'trxId' => $r['trx_id'], 'claimedAt' => $r['claimed_at']], $rows);
            Database::jsonResponse(['success' => true, 'claims' => $claims, 'total' => count($claims)]);
        }
        break;

    default:
        Database::errorResponse("Unknown admin section: {$section}", 404);
        break;
}
