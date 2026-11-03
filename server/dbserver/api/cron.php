<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/cron_engine.php';
date_default_timezone_set('Asia/Dhaka');
header('Cache-Control: no-store');
if (PHP_SAPI !== 'cli') {
    if (!in_array($_SERVER['REQUEST_METHOD'] ?? '', ['GET', 'POST'], true)) Database::errorResponse('Method Not Allowed', 405);
    $s = Database::fetchOne('SELECT key_hash FROM cron_engine_state WHERE id=1');
    if (!bbCronAuthorized($_SERVER['HTTP_X_CRON_KEY'] ?? '', $s['key_hash'] ?? null)) Database::errorResponse('Unauthorized cron request', 401);
}
$result = bbCronRun();
if (PHP_SAPI === 'cli') { echo json_encode($result) . PHP_EOL; exit($result['success'] ? 0 : 1); }
Database::jsonResponse($result, $result['success'] ? 200 : 503);