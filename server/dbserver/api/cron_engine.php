<?php
/** Prepare member snapshots and issue VIP salary cards; never credit wallet or approve payments. */
require_once __DIR__ . '/vip_salary.php';
function bbCronWindows(array $rules, array $mystery, int $timestamp): array {
    $now = (new DateTimeImmutable('@' . $timestamp))->setTimezone(new DateTimeZone('Asia/Dhaka'));
    $hour = (int)$now->format('G'); $minute = (int)$now->format('i');
    $packet = $rules['redPacket'];
    return [
        'serverTime' => $now->format('Y-m-d H:i:s'), 'timezone' => 'Asia/Dhaka',
        'redPacket' => $packet['enabled'] && in_array($hour, $packet['hours'], true) && $minute < $packet['durationMinutes'],
        'rescue' => $rules['rescue']['enabled'] && $hour < $rules['rescue']['claimDeadlineHour'],
        'slotDaily' => $rules['slotDaily']['enabled'] && $hour >= $rules['slotDaily']['claimFromHour'],
        'vipWeekly' => (int)$now->format('N') === $rules['vip']['weeklyClaimDay'],
        'vipMonthly' => (int)$now->format('j') === $rules['vip']['monthlyClaimDay'],
        'memberDay' => $rules['memberDay']['enabled'] && (int)$now->format('j') === $rules['memberDay']['day'],
        'mystery' => !empty($mystery['enabled']) && (int)$now->format('j') === (int)$mystery['triggerDayOfMonth'] && $hour >= (int)$mystery['triggerHour'],
    ];
}

/** A unit and its cursor commit together; failure leaves the last successful cursor intact. */
function bbCronProcessBatch(array $ids, callable $unit, callable $commit, float $deadline): int {
    $count = 0;
    foreach ($ids as $id) {
        if (microtime(true) >= $deadline) break;
        $commit($id, $unit($id));
        $count++;
    }
    return $count;
}

function bbCronAuthorized(string $provided, ?string $hash): bool {
    return $hash !== null && $hash !== '' && strlen($provided) >= 32 && strlen($provided) <= 256 && password_verify($provided, $hash);
}

function bbCronStatus(): array {
    $s = Database::fetchOne('SELECT * FROM cron_engine_state WHERE id=1');
    if (!$s) throw new RuntimeException('Cron schema is not installed');
    // Neither the credential nor its hash is returned to the browser.
    return [
        'enabled' => (bool)$s['enabled'], 'httpKeyConfigured' => !empty($s['key_hash']),
        'lastStarted' => $s['last_started'], 'lastFinished' => $s['last_finished'],
        'lastSuccess' => $s['last_success'], 'status' => $s['status'],
        'processed' => (int)$s['processed'], 'cycleComplete' => (bool)$s['cycle_complete'],
        'salaryPendingJobs' => (int)Database::fetchOne('SELECT COUNT(*) c FROM vip_salary_jobs WHERE complete=0')['c'],
        'lastError' => $s['last_error'], 'windows' => json_decode($s['windows_json'] ?? '{}', true),
        'serverTime' => date('Y-m-d H:i:s'), 'timezone' => 'Asia/Dhaka',
        'stale' => !$s['last_started'] || time() - strtotime($s['last_started']) > 180,
        'cliPath' => __DIR__ . '/cron.php', 'batchLimit' => 25, 'budgetSeconds' => 15,
    ];
}

function bbCronRun(): array {
    date_default_timezone_set('Asia/Dhaka');
    $pdo = Database::getConnection();
    if (!(int)Database::fetchOne("SELECT GET_LOCK('bengalbet_minute_cron', 0) acquired")['acquired']) {
        return ['success' => true, 'status' => 'busy', 'processedThisCall' => 0];
    }
    try {
        $s = Database::fetchOne('SELECT * FROM cron_engine_state WHERE id=1');
        if (!$s) throw new RuntimeException('Cron schema is not installed');
        if (!(bool)$s['enabled']) return ['success' => true, 'status' => 'disabled', 'processedThisCall' => 0];
        require_once __DIR__ . '/promo_content.php';
        $live = bbPromoLiveRules(); $now = time(); $minute = date('Y-m-d H:i', $now);
        $windows = bbCronWindows($live['promoRules'], $live['mystery'], $now);
        $deadline=microtime(true)+15;
        bbSalaryPrepare($live,date('Y-m-d',$now));
        $salaryCount=bbSalaryProcess($deadline);
        Database::execute("UPDATE cron_engine_state SET last_started=?, status='running', last_error=NULL, windows_json=? WHERE id=1", [date('Y-m-d H:i:s', $now), json_encode($windows)]);
        if ((bool)$s['cycle_complete']) {
            if ($s['cycle_minute'] === $minute) {
                $pending=(int)Database::fetchOne('SELECT COUNT(*) c FROM vip_salary_jobs WHERE complete=0')['c'];
                Database::execute("UPDATE cron_engine_state SET status=?, last_finished=?, last_success=? WHERE id=1", [$pending?'pending':'idle',date('Y-m-d H:i:s'), date('Y-m-d H:i:s')]);
                return ['success' => true, 'status' => $pending?'pending':'idle', 'processedThisCall' => 0, 'salaryProcessedThisCall'=>$salaryCount, 'state' => bbCronStatus()];
            }
            $upper = Database::fetchOne("SELECT MAX(id) upper_id FROM users WHERE status='active'")['upper_id'] ?? '';
            Database::execute('UPDATE cron_engine_state SET cursor_id=?, upper_id=?, cycle_minute=?, cycle_complete=0, processed=0 WHERE id=1', ['', $upper, $minute]);
            $s['cursor_id'] = ''; $s['upper_id'] = $upper;
        }
        $ids = array_column(Database::fetchAll("SELECT id FROM users WHERE status='active' AND id>? AND id<=? ORDER BY id LIMIT 25", [$s['cursor_id'], $s['upper_id']]), 'id');
        $today = date('Y-m-d', $now); $yesterday = date('Y-m-d', strtotime('-1 day', $now));
        $unit = function ($uid) use ($today, $yesterday, $now, $live) {
            $y = Database::fetchAll('SELECT category, COALESCE(SUM(bet_amount),0) bet, COALESCE(SUM(reward),0) win FROM bets WHERE user_id=? AND date=? GROUP BY category', [$uid, $yesterday]);
            $t = Database::fetchAll('SELECT category, COALESCE(SUM(valid_bet),0) bet FROM bets WHERE user_id=? AND date=? GROUP BY category', [$uid, $today]);
            $end = date('Y-m', $now) . '-' . sprintf('%02d', max(1, (int)$live['mystery']['triggerDayOfMonth'] - 1));
            $month = Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) total FROM bets WHERE user_id=? AND date BETWEEN ? AND ?', [$uid, date('Y-m-01', $now), $end]);
            return ['asOf' => date('Y-m-d H:i:s'), 'day' => $today, 'yesterday' => $y, 'today' => $t, 'mysteryPeriodBet' => (float)$month['total']];
        };
        $commit = function ($uid, $data) use ($pdo) {
            try {
                $pdo->beginTransaction();
                Database::execute('INSERT INTO cron_member_snapshots (user_id, snapshot_json, checked_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE snapshot_json=VALUES(snapshot_json), checked_at=VALUES(checked_at)', [$uid, json_encode($data), date('Y-m-d H:i:s')]);
                Database::execute('UPDATE cron_engine_state SET cursor_id=?, processed=processed+1 WHERE id=1', [$uid]);
                $pdo->commit();
            } catch (Throwable $e) { if ($pdo->inTransaction()) $pdo->rollBack(); throw $e; }
        };
        $count = bbCronProcessBatch($ids, $unit, $commit, $deadline);
        $current = Database::fetchOne('SELECT cursor_id,upper_id FROM cron_engine_state WHERE id=1');
        $more = Database::fetchOne("SELECT id FROM users WHERE status='active' AND id>? AND id<=? ORDER BY id LIMIT 1", [$current['cursor_id'], $current['upper_id']]);
        $pendingSalary=(int)Database::fetchOne('SELECT COUNT(*) c FROM vip_salary_jobs WHERE complete=0')['c'];
        $status=$more||$pendingSalary?'pending':'complete';
        Database::execute('UPDATE cron_engine_state SET cycle_complete=?, status=?, last_finished=?, last_success=? WHERE id=1', [$more ? 0 : 1, $status, date('Y-m-d H:i:s'), date('Y-m-d H:i:s')]);
        return ['success' => true, 'status' => $status, 'processedThisCall' => $count, 'salaryProcessedThisCall'=>$salaryCount, 'state' => bbCronStatus()];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        Database::execute("UPDATE cron_engine_state SET status='error', last_error=?, last_finished=? WHERE id=1", ['Scheduled work failed; the unchanged checkpoint will retry on the next call.', date('Y-m-d H:i:s')]);
        return ['success' => false, 'status' => 'error', 'message' => 'Scheduled work failed; check server logs. Saved progress is retained.'];
    } finally {
        Database::fetchOne("SELECT RELEASE_LOCK('bengalbet_minute_cron') released");
    }
}