<?php
require_once __DIR__ . '/promo_rules.php';
/** Server-authoritative reward guard and atomic settlement. */
function bbMysteryConfig(): array {
 $defaults=['enabled'=>true,'minBonusAmount'=>1000,'maxBonusAmount'=>50000,'triggerDayOfMonth'=>23,'triggerHour'=>18,'minBetRequired'=>500,'promoCode'=>'','wageringTurnover'=>1,'autoCreditEnabled'=>false];
 $row=Database::fetchOne('SELECT config_json FROM mystery_reward_config WHERE id=1');
 return $row ? array_merge($defaults,json_decode($row['config_json'],true) ?: []) : $defaults;
}
function bbRewardCredit(string $uid,float $amount,string $description): float {
 if(!is_finite($amount) || $amount<=0) throw new RuntimeException('এই পুরস্কারের জন্য কোনো অনুমোদিত অর্থ নেই।');
 Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$amount,$uid]);
 Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$uid,'type'=>'bonus','amount'=>$amount,'channel'=>'system','trx_id'=>'RWD'.bin2hex(random_bytes(12)),'status'=>'success','description'=>$description,'created_at'=>date('Y-m-d H:i:s')]);
 return (float)Database::fetchOne('SELECT balance FROM users WHERE id=?',[$uid])['balance'];
}
$bbModule=basename($_SERVER['SCRIPT_FILENAME'] ?? '');
// Installed endpoint passes its module explicitly.
if($rewardModule==='mystery' && $action==='status') {
 $config=bbMysteryConfig(); $month=date('Y-m'); $card=Database::fetchOne('SELECT * FROM mystery_cash_cards WHERE user_id=? AND month_year=?',[$userId,$month]);
 $sum=Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) AS total FROM bets WHERE user_id=? AND date BETWEEN ? AND ?',[$userId,$month.'-01',$month.'-'.sprintf('%02d',max(1,(int)$config['triggerDayOfMonth']-1))]);
 $day=(int)date('j')===(int)$config['triggerDayOfMonth']; $hour=(int)date('G')>=(int)$config['triggerHour']; $claimed=$card && $card['status']==='claimed';
 $eligible=(bool)$config['enabled'] && (float)$sum['total']>=(float)$config['minBetRequired'];
 Database::jsonResponse(['success'=>true,'enabled'=>(bool)$config['enabled'],'currentDate'=>date('Y-m-d H:i:s'),'is23rdToday'=>$day,'isPast6PM'=>$hour,'isUnlocked'=>$day && $hour && $eligible && !$claimed,'hasClaimed'=>(bool)$claimed,'claimedCard'=>$claimed ? $card : null,'unlockedCard'=>$card && !$claimed ? $card : null,'userBetTotal'=>(float)$sum['total'],'minBetRequired'=>(float)$config['minBetRequired'],'isBetSatisfied'=>$eligible,'isEligible'=>$eligible,'config'=>$config]);
}
if(($rewardModule==='promos') && in_array($action,['','active'],true)) {
 $rows=Database::fetchAll("SELECT * FROM promo_codes WHERE status='active' AND (expires_at IS NULL OR expires_at>NOW()) AND current_usage_count<max_usage_count ORDER BY created_at DESC");
 Database::jsonResponse(['success'=>true,'promos'=>$rows]);
}
if(!in_array($action,['claim','redeem'],true)) return;
if($method!=='POST') Database::errorResponse('Method Not Allowed',405);
$pdo=Database::getConnection();
try {
 $pdo->beginTransaction();
 $user=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$userId]);
 if(!$user || $user['status']!=='active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
 $now=date('Y-m-d H:i:s'); $today=date('Y-m-d'); $bonus=0; $extra=[];
 if($rewardModule==='vip') {
  require_once __DIR__.'/vip_progress.php'; $user['vip_level']=bbVipSync($userId);
  $type=$input['type'] ?? ''; $level=filter_var($input['level'] ?? null,FILTER_VALIDATE_INT);
  if(!in_array($type,['upgrade','weekly','monthly','birthday'],true) || $level===false || $level<1 || $level>(int)$user['vip_level']) throw new RuntimeException('ভিআইপি পুরস্কারের যোগ্যতা পূরণ হয়নি।');
  if($type!=='upgrade' && $level!==(int)$user['vip_level']) throw new RuntimeException('বর্তমান ভিআইপি স্তরের পুরস্কার দাবি করুন।');
  $tier=Database::fetchOne("SELECT * FROM vip_tiers WHERE level=? AND status='active'",[$level]);
  if(!$tier) throw new RuntimeException('ভিআইপি স্তর সক্রিয় নয়।');
  $bonus=(float)$tier[$type.'_bonus'];
  $where='user_id=? AND type=?'; $params=[$userId,$type];
  if($type==='upgrade') { $where.=' AND level=?'; $params[]=$level; }
  elseif($type==='weekly') { $vd=(int)bbPromoRules()['vip']['weeklyClaimDay']; if((int)date('N')!==$vd) throw new RuntimeException('সাপ্তাহিক ভিআইপি বোনাস শুধু '.['','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার','রবিবার'][$vd].' দাবি করা যায়।'); $where.=' AND date>=?'; $params[]=date('Y-m-d',strtotime('monday this week')); }
  elseif($type==='monthly') { $md=(int)bbPromoRules()['vip']['monthlyClaimDay']; if((int)date('j')!==$md) throw new RuntimeException('মাসিক ভিআইপি বোনাস শুধু মাসের '.$md.' তারিখে দাবি করা যায়।'); $where.=' AND date>=?'; $params[]=date('Y-m-01'); }
  else { $birth=DateTimeImmutable::createFromFormat('!Y-m-d',$user['birthday'] ?? ''); if(!$birth || $birth->format('m-d')!==date('m-d')) throw new RuntimeException('আজ সংরক্ষিত জন্মদিন নয়।'); $where.=' AND date>=?'; $params[]=date('Y-01-01'); }
  if(Database::fetchOne('SELECT id FROM vip_claims WHERE '.$where.' LIMIT 1',$params)) throw new RuntimeException('এই সময়ের ভিআইপি পুরস্কার ইতিমধ্যে গ্রহণ করেছেন।');
  $description='VIP'.$level.' '.$type.' পুরস্কার';
  Database::insert('vip_claims',['id'=>'vipc-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'username'=>$user['username'],'level'=>$level,'type'=>$type,'event_name'=>$description,'bonus'=>$bonus,'points'=>(int)($bonus*10),'ticket_name'=>'VIP'.$level,'date'=>$today,'timestamp'=>(int)round(microtime(true)*1000),'status'=>'claimed','created_at'=>$now]);
 } elseif($rewardModule==='rescue') {
  // Plan: yesterday's slot/fishing loss, claimable the next day until 10:00 (Bangladesh time)
  $rr=bbPromoRules()['rescue'];
  if(empty($rr['enabled'])) throw new RuntimeException('উদ্ধার তহবিল এখন বন্ধ।');
  $date=date('Y-m-d',strtotime('-1 day'));
  if((int)date('G')>=(int)$rr['claimDeadlineHour']) throw new RuntimeException('উদ্ধার তহবিল প্রতিদিন '.(int)$rr['claimDeadlineHour'].':00 এর মধ্যে দাবি করতে হয়।');
  $catIn=implode(',',array_fill(0,count($rr['categories']),'?'));
  if(Database::fetchOne('SELECT id FROM rescue_claims WHERE user_id=? AND date=?',[$userId,$date])) throw new RuntimeException('গতকালের উদ্ধার তহবিল ইতিমধ্যে দাবি করেছেন।');
  $sum=Database::fetchOne("SELECT COALESCE(SUM(bet_amount),0) AS bet,COALESCE(SUM(reward),0) AS win FROM bets WHERE user_id=? AND date=? AND category IN ($catIn)",array_merge([$userId,$date],$rr['categories']));
  $loss=max(0,(float)$sum['bet']-(float)$sum['win']);
  $tier=Database::fetchOne("SELECT * FROM rescue_tiers WHERE status='active' AND min_loss<=? ORDER BY min_loss DESC LIMIT 1",[$loss]);
  if($loss<=0 || !$tier) throw new RuntimeException('উদ্ধার তহবিলের ক্ষতির শর্ত পূরণ হয়নি।');
  $bonus=min((float)$tier['max_bonus'],round($loss*(float)$tier['percentage']/100,2)); $description='উদ্ধার তহবিল';
  $claim=['id'=>'resc-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'username'=>$user['username'],'date'=>$date,'total_bet'=>$sum['bet'],'total_win'=>$sum['win'],'net_loss'=>$loss,'percentage'=>$tier['percentage'],'bonus_amount'=>$bonus,'status'=>'approved','claimed_at'=>$now];
  Database::insert('rescue_claims',$claim); $extra['claim']=['id'=>$claim['id'],'bonusAmount'=>$bonus];
 } elseif($rewardModule==='promos') {
  $code=strtoupper(trim($input['code'] ?? ''));
  $promo=Database::fetchOne('SELECT * FROM promo_codes WHERE code=? FOR UPDATE',[$code]);
  if(!$promo || $promo['status']!=='active' || (!empty($promo['expires_at']) && strtotime($promo['expires_at'])<=time())) throw new RuntimeException('অবৈধ বা মেয়াদোত্তীর্ণ প্রচার কোড।');
  if($promo['type']!=='fixed_cash') throw new RuntimeException('এই পুরস্কারের ধরন নগদ হিসেবে গ্রহণ করা যায় না।');
  if((int)$promo['current_usage_count']>=(int)$promo['max_usage_count'] || (int)$user['vip_level']<(int)$promo['min_vip_level']) throw new RuntimeException('প্রচার কোডের সীমা বা ভিআইপি শর্ত পূরণ হয়নি।');
  if(Database::fetchOne('SELECT id FROM promo_redemptions WHERE promo_id=? AND user_id=?',[$promo['id'],$userId])) throw new RuntimeException('এই কোড ইতিমধ্যে ব্যবহার করেছেন।');
  $bonus=(float)$promo['amount']; $description='প্রচার কোড '.$code;
  Database::insert('promo_redemptions',['id'=>'pred-'.bin2hex(random_bytes(12)),'promo_id'=>$promo['id'],'code'=>$code,'user_id'=>$userId,'username'=>$user['username'],'bonus_amount'=>$bonus,'redeemed_at'=>$now]);
  Database::execute('UPDATE promo_codes SET current_usage_count=current_usage_count+1 WHERE id=?',[$promo['id']]); $extra['code']=$code;
 } elseif($rewardModule==='mystery') {
  $config=bbMysteryConfig(); $month=date('Y-m');
  if(!$config['enabled'] || (int)date('j')!==(int)$config['triggerDayOfMonth'] || (int)date('G')<(int)$config['triggerHour']) throw new RuntimeException('রহস্য পুরস্কারের নির্ধারিত সময় এখন নয়।');
  // Plan: turnover from the 1st up to the day before the trigger day
  $sum=Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) AS total FROM bets WHERE user_id=? AND date BETWEEN ? AND ?',[$userId,$month.'-01',$month.'-'.sprintf('%02d',max(1,(int)$config['triggerDayOfMonth']-1))]);
  if((float)$sum['total']<(float)$config['minBetRequired']) throw new RuntimeException('মাসিক বেটের শর্ত পূরণ হয়নি।');
  $card=Database::fetchOne('SELECT * FROM mystery_cash_cards WHERE user_id=? AND month_year=?',[$userId,$month]);
  if($card && ($card['status']==='claimed' || !(bool)$card['eligible'])) throw new RuntimeException('এই মাসের কার্ড অযোগ্য অথবা ইতিমধ্যে গ্রহণ করেছেন।');
  $bonus=$card ? (float)$card['bonus_amount'] : random_int((int)round($config['minBonusAmount']*100),(int)round($config['maxBonusAmount']*100))/100;
  $ticket=$card['ticket_code'] ?? 'MYS-'.strtoupper(bin2hex(random_bytes(8))); $turnover=$bonus*(float)$config['wageringTurnover'];
  if($card) Database::update('mystery_cash_cards',['status'=>'claimed','claimed_at'=>$now],'id=?',[$card['id']]);
  else Database::insert('mystery_cash_cards',['id'=>'mcc-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'username'=>$user['username'],'month_year'=>$month,'bonus_amount'=>$bonus,'status'=>'claimed','eligible'=>1,'user_bet_amount'=>$sum['total'],'turnover_required'=>$turnover,'turnover_completed'=>0,'ticket_code'=>$ticket,'unlocked_at'=>$now,'claimed_at'=>$now]);
  $description='রহস্য পুরস্কার '.$month; $extra=['turnoverRequired'=>$turnover,'card'=>['monthYear'=>$month,'bonusAmount'=>$bonus,'status'=>'claimed','ticketCode'=>$ticket],'ticket'=>['code'=>$ticket,'name'=>'রহস্য ক্যাশ কার্ড','amount'=>$bonus]];
 } else throw new RuntimeException('Unknown reward module');
 $balance=bbRewardCredit($userId,$bonus,$description); $pdo->commit();
 Database::jsonResponse(array_merge(['success'=>true,'message'=>'পুরস্কার একবার অ্যাকাউন্টে জমা হয়েছে।','bonusAmount'=>$bonus,'newBalance'=>$balance],$extra));
} catch(Throwable $e) {
 if($pdo->inTransaction()) $pdo->rollBack();
 Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'পুরস্কার সংরক্ষণ ব্যর্থ হয়েছে।',400);
}
