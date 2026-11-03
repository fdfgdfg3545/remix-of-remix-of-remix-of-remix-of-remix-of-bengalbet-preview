<?php
require_once __DIR__.'/../config.php';
require_once __DIR__.'/../db.php';
require_once __DIR__.'/daily_signin_rules.php';
require_once __DIR__.'/bonus_eligibility.php';
$method=$_SERVER['REQUEST_METHOD']; $action=$_GET['action'] ?? 'status';
$userId=Database::requireUser(); $today=date('Y-m-d');
if(strpos($action,'new-member-')===0){$_GET['action']=substr($action,11);require __DIR__.'/new_member.php';exit;}
$config=bbSigninConfig();
if($action==='status') {
 $last=Database::fetchOne('SELECT * FROM daily_signin_records WHERE user_id=? ORDER BY date DESC LIMIT 1',[$userId]);
 $state=bbSigninNext($last,$today,$config);
 $history=Database::fetchAll('SELECT * FROM daily_signin_records WHERE user_id=? ORDER BY date DESC LIMIT 30',[$userId]);
 $bet=Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) AS total FROM bets WHERE user_id=? AND date=?',[$userId,$today]);
 Database::jsonResponse(['success'=>true,'currentStreak'=>$last ? (int)$last['streak'] : 0,'totalClaimedBonus'=>round(array_sum(array_column($history,'bonus')),2),'hasSignedToday'=>$state['hasSignedToday'],'todayDayNumber'=>$state['day'],'todayBonus'=>$state['bonus'],'lastSignDate'=>$last['date'] ?? null,'history'=>$history,'config'=>$config,'isEligible'=>$config['enabled'] && !$state['hasSignedToday'] && (float)$bet['total'] >= $config['dailyRequiredBet']]);
}
if($action==='claim') {
 if($method!=='POST') Database::errorResponse('Method Not Allowed',405);
 $pdo=Database::getConnection();
 try {
  $pdo->beginTransaction();
  $user=Database::fetchOne('SELECT username,balance FROM users WHERE id=? FOR UPDATE',[$userId]);
  if(!$user) throw new RuntimeException('User not found');
  bbRequireBonusDeposit($userId);
  $last=Database::fetchOne('SELECT * FROM daily_signin_records WHERE user_id=? ORDER BY date DESC LIMIT 1',[$userId]);
  $state=bbSigninNext($last,$today,$config);
  if(!$config['enabled']) throw new RuntimeException('দৈনিক পুরস্কার বন্ধ আছে।');
  if($state['hasSignedToday']) throw new RuntimeException('আজকের পুরস্কার ইতিমধ্যে গ্রহণ করেছেন।');
  $bet=Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) AS total FROM bets WHERE user_id=? AND date=?',[$userId,$today]);
  if((float)$bet['total']<$config['dailyRequiredBet']) throw new RuntimeException('আজকের বেটের শর্ত পূরণ হয়নি।');
  $bonus=$state['bonus']; $now=date('Y-m-d H:i:s');
  Database::insert('daily_signin_records',['id'=>'ds-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'username'=>$user['username'],'day'=>$state['day'],'bonus'=>$bonus,'date'=>$today,'streak'=>$state['streak'],'status'=>'claimed','claimed_at'=>$now]);
  Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$bonus,$userId]);
  Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'type'=>'bonus','amount'=>$bonus,'channel'=>'system','trx_id'=>'DS'.bin2hex(random_bytes(12)),'status'=>'success','description'=>'দিন '.$state['day'].' দৈনিক সাইন-ইন বোনাস','created_at'=>$now]);
  $balance=Database::fetchOne('SELECT balance FROM users WHERE id=?',[$userId]);
  $pdo->commit();
  Database::jsonResponse(['success'=>true,'message'=>'দৈনিক পুরস্কার অ্যাকাউন্টে জমা হয়েছে।','bonus'=>$bonus,'streak'=>$state['streak'],'dayNumber'=>$state['day'],'newBalance'=>(float)$balance['balance']]);
 } catch(Throwable $e) {
  if($pdo->inTransaction()) $pdo->rollBack();
  Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'পুরস্কার সংরক্ষণ ব্যর্থ হয়েছে।',400);
 }
}
Database::errorResponse('Unknown daily signin action',404);
