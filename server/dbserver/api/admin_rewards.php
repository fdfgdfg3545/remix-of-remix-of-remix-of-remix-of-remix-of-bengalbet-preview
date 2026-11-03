<?php
/** Read-only reward admin contracts. Invoked by authenticated admin.php. */
Database::requireAdmin();
require_once __DIR__.'/promo_rules.php';
require_once __DIR__.'/mystery_rules.php';
if($section==='mystery-reward' && $action==='config') {
 if($method==='GET')Database::jsonResponse(['success'=>true,'config'=>bbMysteryConfig()]);
 if($method==='DELETE'){Database::execute('DELETE FROM mystery_reward_config WHERE id=1');Database::jsonResponse(['success'=>true,'config'=>bbMysteryConfig()]);}
 if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
 try{$config=bbValidateMystery($input);}catch(InvalidArgumentException $e){Database::errorResponse($e->getMessage(),422);}
 Database::execute('INSERT INTO mystery_reward_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($config,JSON_UNESCAPED_UNICODE)]);
 Database::jsonResponse(['success'=>true,'config'=>bbMysteryConfig()]);
}
require_once __DIR__ . '/daily_signin_rules.php';
if ($section === 'daily-signin' && $action === 'config' && $method === 'POST') {
    try { $config=bbSigninValidatedConfig($input); }
    catch(InvalidArgumentException $e) { Database::errorResponse($e->getMessage(),422); }
    Database::execute('INSERT INTO daily_signin_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($config,JSON_UNESCAPED_UNICODE)]);
    Database::jsonResponse(['success'=>true,'message'=>'Daily configuration saved','config'=>$config]);
}
require_once __DIR__.'/new_member_rules.php';
if($section==='daily-signin' && $action==='new-member-config') {
 if($method==='GET')Database::jsonResponse(['success'=>true,'config'=>bbMemberConfig()]);
 if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
 try {$config=bbValidateMemberConfig($input);}catch(InvalidArgumentException $e){Database::errorResponse($e->getMessage(),422);}
 Database::execute('INSERT INTO new_member_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($config,JSON_UNESCAPED_UNICODE)]);
 Database::jsonResponse(['success'=>true,'config'=>$config]);
}
require_once __DIR__.'/deposit_offer_rules.php';
if($section==='deposit-offer' && $action==='config') {
 if($method==='GET')Database::jsonResponse(['success'=>true,'offer'=>bbDepositOffer()]);
 if($method==='DELETE'){Database::execute('DELETE FROM deposit_offer_config WHERE id=1');Database::jsonResponse(['success'=>true,'offer'=>bbDepositOffer()]);}
 if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
 try {$offer=bbValidateDepositOffer($input);}catch(InvalidArgumentException $e){Database::errorResponse($e->getMessage(),422);}
 Database::execute('INSERT INTO deposit_offer_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($offer)]);
 Database::jsonResponse(['success'=>true,'offer'=>bbDepositOffer()]);
}
require_once __DIR__.'/promo_content.php';
if($section==='promo-content' && $action==='config') {
 if($method==='GET')Database::jsonResponse(['success'=>true,'promotions'=>bbPromoContent()]);
 if($method==='DELETE'){Database::execute('DELETE FROM promo_content_config WHERE id=1');Database::jsonResponse(['success'=>true,'promotions'=>null]);}
 if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
 try {$list=bbValidatePromoContent($input['promotions'] ?? null);}catch(InvalidArgumentException $e){Database::errorResponse($e->getMessage(),422);}
 Database::execute('INSERT INTO promo_content_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($list,JSON_UNESCAPED_UNICODE)]);
 Database::jsonResponse(['success'=>true,'promotions'=>bbPromoContent()]);
}
require_once __DIR__.'/promo_rules.php';
if($section==='promo-rules' && $action==='config') {
 if($method==='GET')Database::jsonResponse(['success'=>true,'rules'=>bbPromoRules(),'defaults'=>bbPromoRulesDefaults()]);
 if($method==='DELETE'){Database::execute('DELETE FROM promo_rules_config WHERE id=1');Database::jsonResponse(['success'=>true,'rules'=>bbPromoRulesDefaults()]);}
 if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
 try {$rules=bbValidatePromoRules($input);}catch(InvalidArgumentException $e){Database::errorResponse($e->getMessage(),422);}
 Database::execute('INSERT INTO promo_rules_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($rules)]);
 Database::jsonResponse(['success'=>true,'rules'=>$rules]);
}
require __DIR__.'/chance_rewards_admin.php';
require __DIR__.'/admin_reward_controls.php';
if ($method !== 'GET') Database::errorResponse('This reward operation is not implemented; no changes were made.',405);
function bbRewardRow(array $row): array {
    $out = [];
    foreach ($row as $key => $value) {
        $name = lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $key))));
        $out[$name] = is_numeric($value) && !in_array($key, ['id','user_id','code','ticket_code'], true) ? 0 + $value : $value;
    }
    foreach (['enabled','eligible'] as $key) if (isset($out[$key])) $out[$key] = (bool)$out[$key];
    if (isset($out['perksJson'])) $out['perks'] = json_decode($out['perksJson'], true) ?: [];
    if (isset($out['monthYear'])) {
        $parts = explode('-', $out['monthYear']);
        $out['year'] = $parts[0] ?? '';
        $out['month'] = $parts[1] ?? '';
        $out['cardCode'] = $out['cardCode'] ?? $out['ticketCode'] ?? '';
        $out['voucherCode'] = $out['voucherCode'] ?? $out['ticketCode'] ?? '';
        $out['turnoverMultiplier'] = $out['bonusAmount'] > 0 ? $out['turnoverRequired'] / $out['bonusAmount'] : 0;
    }
    return $out;
}
function bbRewardRows(string $table, string $order, array $filters = []): array {
    $where = []; $params = [];
    foreach ($filters as $key => $value) if ($value !== '' && $value !== 'all') { $where[] = '`' . $key . '` = ?'; $params[] = $value; }
    $search = trim($_GET['search'] ?? '');
    if ($search !== '') { $where[] = '(`username` LIKE ? OR `user_id` LIKE ?)'; $params[] = '%' . $search . '%'; $params[] = '%' . $search . '%'; }
    $sql = 'SELECT * FROM `' . $table . '`' . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . ' ORDER BY ' . $order;
    return array_map('bbRewardRow', Database::fetchAll($sql, $params));
}
switch ($section) {
case 'daily-signin':
    if ($action === 'config') {
        $row = Database::fetchOne('SELECT config_json FROM daily_signin_config WHERE id = 1');
        $config = $row ? json_decode($row['config_json'], true) : null;
        if (!$config) {
            $config = ['enabled'=>true, 'cycleDays'=>30, 'dailyRequiredBet'=>0, 'days'=>[]];
            for ($day=1; $day<=30; $day++) $config['days'][] = ['day'=>$day, 'bonus'=>round(2 + $day * 1.5, 2)];
        }
        Database::jsonResponse(['success'=>true, 'config'=>$config, 'configured'=>(bool)$row]);
    }
    if ($action === 'records') {
        $rows = bbRewardRows('daily_signin_records', '`claimed_at` DESC', ['date'=>$_GET['date'] ?? '']);
        Database::jsonResponse(['success'=>true,'records'=>$rows,'total'=>count($rows)]);
    }
    break;
case 'vip':
    $tiers = array_map('bbRewardRow', Database::fetchAll('SELECT * FROM vip_tiers ORDER BY level ASC'));
    if ($action === 'tiers') Database::jsonResponse(['success'=>true,'tiers'=>$tiers,'count'=>count($tiers)]);
    $claims = bbRewardRows('vip_claims', '`timestamp` DESC');
    if ($action === 'claims') Database::jsonResponse(['success'=>true,'claims'=>$claims,'count'=>count($claims)]);
    if ($action === 'stats') {
        $levels=[];
        foreach (Database::fetchAll('SELECT vip_level, COUNT(*) AS total FROM users GROUP BY vip_level') as $row) $levels[(int)$row['vip_level']] = (int)$row['total'];
        Database::jsonResponse(['success'=>true,'stats'=>['totalTiers'=>count($tiers),'totalClaimsCount'=>count($claims),'totalBonusDistributed'=>array_sum(array_column($claims,'bonus')),'levelCounts'=>$levels,'tiers'=>$tiers,'recentClaims'=>array_slice($claims,0,50)]]);
    }
    break;
case 'rescue':
    if ($action === 'tiers') {
        $rows=array_map('bbRewardRow', Database::fetchAll('SELECT * FROM rescue_tiers ORDER BY min_loss ASC'));
        Database::jsonResponse(['success'=>true,'tiers'=>$rows]);
    }
    if ($action === 'claims') {
        $rows=bbRewardRows('rescue_claims','`claimed_at` DESC',['status'=>$_GET['status'] ?? '']);
        Database::jsonResponse(['success'=>true,'claims'=>$rows,'total'=>count($rows)]);
    }
    break;
case 'promos':
    if ($action === 'redemptions') {
        $rows=bbRewardRows('promo_redemptions','`redeemed_at` DESC',['code'=>$_GET['code'] ?? '']);
        Database::jsonResponse(['success'=>true,'redemptions'=>$rows,'total'=>count($rows)]);
    }
    if ($action === '' || $action === 'list') {
        $where=[]; $params=[];
        if (!empty($_GET['status']) && $_GET['status'] !== 'all') { $where[]='status = ?'; $params[]=$_GET['status']; }
        if (!empty($_GET['search'])) { $where[]='(code LIKE ? OR title LIKE ?)'; $params[]='%'.$_GET['search'].'%'; $params[]='%'.$_GET['search'].'%'; }
        $rows=array_map('bbRewardRow',Database::fetchAll('SELECT * FROM promo_codes'.($where ? ' WHERE '.implode(' AND ',$where) : '').' ORDER BY created_at DESC',$params));
        Database::jsonResponse(['success'=>true,'promos'=>$rows,'total'=>count($rows)]);
    }
    break;
case 'mystery-reward':
    if ($action === 'config') {
        Database::jsonResponse(['success'=>true,'config'=>bbMysteryConfig()]);
    }
    if ($action === 'cards') {
        $rows=bbRewardRows('mystery_cash_cards','`unlocked_at` DESC',['status'=>$_GET['status'] ?? '', 'month_year'=>$_GET['monthYear'] ?? '']);
        Database::jsonResponse(['success'=>true,'cards'=>$rows,'total'=>count($rows)]);
    }
    break;
}
Database::errorResponse('Unknown reward admin action',404);
