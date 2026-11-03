<?php
Database::requireAdmin();
function bbControlNumber(array $input,string $key,float $max=100000000): float {
 $v=$input[$key] ?? null; if(!is_numeric($v) || !is_finite((float)$v) || $v<0 || $v>$max) throw new InvalidArgumentException('Invalid '.$key); return round((float)$v,2);
}
function bbControlText(array $input,string $key,int $max=128): string {
 $v=trim($input[$key] ?? ''); if($v==='' || strlen($v)>$max) throw new InvalidArgumentException('Invalid '.$key); return $v;
}
function bbControlEnum(array $input,string $key,array $allowed): string {
 $v=$input[$key] ?? ''; if(!in_array($v,$allowed,true)) throw new InvalidArgumentException('Invalid '.$key);return $v;
}
if($method==='GET') return;
$id=$_GET['id'] ?? $input['id'] ?? '';
try {
 if($section==='mystery-reward' && $action==='config' && in_array($method,['PUT','POST'],true)) {
  $config=$input; foreach(['enabled','autoCreditEnabled'] as $key)if(!isset($config[$key]) || !is_bool($config[$key]))throw new InvalidArgumentException('Invalid '.$key);
  foreach(['minBonusAmount','maxBonusAmount','minBetRequired','wageringTurnover'] as $key)$config[$key]=bbControlNumber($input,$key);
  foreach(['triggerDayOfMonth'=>31,'triggerHour'=>23] as $key=>$max){$v=filter_var($input[$key] ?? null,FILTER_VALIDATE_INT);if($v===false || $v<($key==='triggerDayOfMonth'?1:0) || $v>$max)throw new InvalidArgumentException('Invalid '.$key);$config[$key]=$v;}
  if($config['maxBonusAmount']<$config['minBonusAmount'])throw new InvalidArgumentException('Invalid bonus range');
  if($config['autoCreditEnabled'])throw new InvalidArgumentException('Automatic settlement requires a scheduled service; keep disabled.');
  $config['promoCode']=substr(trim($input['promoCode'] ?? ''),0,64);
  Database::execute('INSERT INTO mystery_reward_config (id,config_json) VALUES (1,?) ON DUPLICATE KEY UPDATE config_json=VALUES(config_json)',[json_encode($config,JSON_UNESCAPED_UNICODE)]);
  Database::jsonResponse(['success'=>true,'message'=>'Configuration saved','config'=>$config]);
 }
 if($section==='rescue' && in_array($action,['tiers','delete'],true)) {
  if($method==='DELETE') {Database::update('rescue_tiers',['status'=>'inactive'],'id=?',[$id]);Database::jsonResponse(['success'=>true,'message'=>'Tier deactivated']);}
  if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
  $row=['min_loss'=>bbControlNumber($input,'minLoss'),'percentage'=>bbControlNumber($input,'percentage',100),'max_bonus'=>bbControlNumber($input,'maxBonus'),'name_bn'=>bbControlText($input,'nameBn'),'description'=>substr($input['description'] ?? '',0,5000),'status'=>bbControlEnum($input,'status',['active','inactive'])];
  if($id!=='')Database::update('rescue_tiers',$row,'id=?',[$id]);else $id=Database::insert('rescue_tiers',$row);
  Database::jsonResponse(['success'=>true,'message'=>'Tier saved','tier'=>bbRewardRow(Database::fetchOne('SELECT * FROM rescue_tiers WHERE id=?',[$id]))]);
 }
 if($section==='vip' && in_array($action,['tiers','delete'],true)) {
  $level=filter_var($input['level'] ?? $id,FILTER_VALIDATE_INT);if($level===false || $level<0 || $level>100)throw new InvalidArgumentException('Invalid level');
  if($method==='DELETE'){Database::update('vip_tiers',['status'=>'inactive'],'level=?',[$level]);Database::jsonResponse(['success'=>true,'message'=>'Tier deactivated']);}
  if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
  $row=['level'=>$level,'name'=>bbControlText($input,'name'),'badge_type'=>bbControlText($input,'badgeType',32),'target_bet_display'=>substr($input['targetBetDisplay'] ?? '',0,64),'description'=>substr($input['description'] ?? '',0,5000),'status'=>$input['status'] ?? 'active','perks_json'=>json_encode($input['perks'] ?? [],JSON_UNESCAPED_UNICODE)];
  $existing=Database::fetchOne('SELECT birthday_bonus,perks_json FROM vip_tiers WHERE level=?',[$level]);
  if(!array_key_exists('birthdayBonus',$input))$input['birthdayBonus']=$existing['birthday_bonus'] ?? 0;
  if(!array_key_exists('perks',$input))$row['perks_json']=$existing['perks_json'] ?? null;
  foreach(['targetBet'=>'target_bet','depositTarget'=>'deposit_target','upgradeBonus'=>'upgrade_bonus','weeklyBonus'=>'weekly_bonus','monthlyBonus'=>'monthly_bonus','birthdayBonus'=>'birthday_bonus','slotRebate'=>'slot_rebate','liveRebate'=>'live_rebate'] as $key=>$column)$row[$column]=bbControlNumber($input,$key,in_array($key,['slotRebate','liveRebate'])?100:100000000);
  if(!in_array($row['status'],['active','inactive'],true))throw new InvalidArgumentException('Invalid status');
  if(Database::fetchOne('SELECT level FROM vip_tiers WHERE level=?',[$level])){unset($row['level']);Database::update('vip_tiers',$row,'level=?',[$level]);}else Database::insert('vip_tiers',$row);
  Database::jsonResponse(['success'=>true,'message'=>'Tier saved','tier'=>bbRewardRow(Database::fetchOne('SELECT * FROM vip_tiers WHERE level=?',[$level]))]);
 }
 if($section==='promos' && !in_array($action,['redemptions'],true)) {
  if($method==='DELETE'){Database::update('promo_codes',['status'=>'inactive'],'id=?',[$id]);Database::jsonResponse(['success'=>true,'message'=>'Code deactivated']);}
  if(!in_array($method,['POST','PUT'],true))Database::errorResponse('Method Not Allowed',405);
  $code=strtoupper(bbControlText($input,'code',64));if(!preg_match('/^[A-Z0-9_-]+$/',$code))throw new InvalidArgumentException('Invalid code');
  $expires=trim($input['expiresAt'] ?? '');if($expires!=='' && strtotime($expires)===false)throw new InvalidArgumentException('Invalid expiry');
  $row=['code'=>$code,'title'=>bbControlText($input,'title'),'amount'=>bbControlNumber($input,'amount'),'type'=>bbControlEnum($input,'type',['fixed_cash']),'min_vip_level'=>(int)bbControlNumber($input,'minVipLevel',100),'max_usage_count'=>(int)bbControlNumber($input,'maxUsageCount',100000000),'expires_at'=>$expires===''?null:date('Y-m-d H:i:s',strtotime($expires)),'status'=>bbControlEnum($input,'status',['active','inactive']),'description'=>substr($input['description'] ?? '',0,5000)];
  if($id!=='')Database::update('promo_codes',$row,'id=?',[$id]);else{$id='promo-'.bin2hex(random_bytes(12));$row['id']=$id;$row['current_usage_count']=0;$row['created_at']=date('Y-m-d H:i:s');Database::insert('promo_codes',$row);}
  Database::jsonResponse(['success'=>true,'message'=>'Code saved','promo'=>bbRewardRow(Database::fetchOne('SELECT * FROM promo_codes WHERE id=?',[$id]))]);
 }
} catch(InvalidArgumentException $e) {Database::errorResponse($e->getMessage(),422);}
catch(Throwable $e) {Database::errorResponse('Settings could not be saved; check unique fields and stored values.',400);}
