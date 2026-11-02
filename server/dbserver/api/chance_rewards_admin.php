<?php
/** Admin prize tables for spin / golden egg / red envelope. Included by admin_rewards.php after requireAdmin(). */
if ($section === 'chance-rewards' && $action === 'config') {
    $file = __DIR__ . '/../data/chance_rewards.json';
    if ($method === 'GET') {
        $cfg = is_file($file) ? json_decode((string)file_get_contents($file), true) : null;
        Database::jsonResponse(['success' => true, 'configured' => is_array($cfg), 'config' => is_array($cfg) ? $cfg : ['spin' => [], 'golden_egg' => [], 'red_envelope' => []]]);
    }
    if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
    $out = [];
    foreach (['spin', 'golden_egg', 'red_envelope'] as $type) {
        $rows = $input[$type] ?? [];
        if (!is_array($rows) || count($rows) > 20) Database::errorResponse("$type: 0-20 prizes allowed", 422);
        $clean = [];
        foreach ($rows as $i => $r) {
            $amt = $r['amount'] ?? null; $w = $r['weight'] ?? null; $label = trim((string)($r['label'] ?? ''));
            if (!is_numeric($amt) || $amt < 0 || $amt > 150000) Database::errorResponse("$type #" . ($i + 1) . ': amount must be 0-150000', 422);
            if (!is_numeric($w) || $w <= 0 || $w > 1000000) Database::errorResponse("$type #" . ($i + 1) . ': weight must be positive', 422);
            $clean[] = ['label' => mb_substr($label !== '' ? $label : ('৳' . (0 + $amt)), 0, 60), 'amount' => round((float)$amt, 2), 'weight' => (float)$w];
        }
        $out[$type] = $clean;
    }
    if (file_put_contents($file, json_encode($out, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false) Database::errorResponse('Could not save prize table', 500);
    Database::jsonResponse(['success' => true, 'config' => json_decode((string)file_get_contents($file), true)]);
}
