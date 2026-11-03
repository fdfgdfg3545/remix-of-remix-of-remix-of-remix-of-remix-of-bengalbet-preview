<?php
// Included only after Database::requireAdmin() by admin.php.
require_once __DIR__ . '/cron_engine.php';
date_default_timezone_set('Asia/Dhaka');
header('Cache-Control: no-store');
if ($method === 'GET' && $action === 'status') Database::jsonResponse(['success' => true, 'state' => bbCronStatus()]);
if ($method === 'POST' && $action === 'run') {
    $r = bbCronRun(); Database::jsonResponse($r, $r['success'] ? 200 : 503);
}
if ($method === 'POST' && $action === 'config') {
    if (!is_bool($input['enabled'] ?? null)) Database::errorResponse('Invalid enabled value', 422);
    if (isset($input['key'])) {
        $key = $input['key'];
        if (!is_string($key) || strlen($key) < 32 || strlen($key) > 256 || preg_match('/[\s\x00-\x1f]/', $key)) Database::errorResponse('Cron key must contain 32–256 non-whitespace characters', 422);
        Database::execute('UPDATE cron_engine_state SET enabled=?,key_hash=? WHERE id=1', [$input['enabled'] ? 1 : 0, password_hash($key, PASSWORD_DEFAULT)]);
    } else Database::execute('UPDATE cron_engine_state SET enabled=? WHERE id=1', [$input['enabled'] ? 1 : 0]);
    Database::jsonResponse(['success' => true, 'state' => bbCronStatus()]);
}
Database::errorResponse('Unsupported cron operation', 405);