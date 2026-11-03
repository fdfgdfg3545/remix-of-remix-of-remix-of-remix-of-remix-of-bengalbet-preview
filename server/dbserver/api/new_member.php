<?php
require_once __DIR__.'/../config.php';require_once __DIR__.'/../db.php';
$userId=Database::requireUser();$action=$_GET['action'] ?? 'status';$input=Database::getJsonInput();
require_once __DIR__.'/new_member_rules.php';
function bbMemberTasks(string $uid): array {
 $config=bbMemberConfig();$definitions=array_map(fn($task)=>[$task['bonus'],$task['requirementType'],$task['requiredAmount']],$config['days']);
 $user=Database::fetchOne('SELECT created_at FROM users WHERE id=?',[$uid]);if(!$user)Database::errorResponse('User not found',404);
 $joined=new DateTimeImmutable(substr($user['created_at'],0,10));$today=new DateTimeImmutable(date('Y-m-d'));$age=(int)$joined->diff($today)->format('%r%a')+1;
 $claims=Database::fetchAll('SELECT day FROM new_member_claims WHERE user_id=?',[$uid]);$claimed=array_map('intval',array_column($claims,'day'));
 $bet=Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) AS total FROM bets WHERE user_id=? AND date=?',[$uid,date('Y-m-d')]);
 $deposit=Database::fetchOne("SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND DATE(created_at)=?",[$uid,date('Y-m-d')]);
 $tasks=[];foreach($definitions as $index=>$definition){$day=$index+1;$previous=$day===1 || in_array($day-1,$claimed,true);$progress=$definition[1]==='bet'?(float)$bet['total']:($definition[1]==='deposit'?(float)$deposit['total']:1);$isClaimed=in_array($day,$claimed,true);$tasks[]=['day'=>$day,'bonus'=>$definition[0],'requirementType'=>$definition[1],'requiredAmount'=>$definition[2],'progress'=>$progress,'claimed'=>$isClaimed,'eligible'=>$config['enabled'] && !$isClaimed && $previous && $age>=$day && $progress>=$definition[2]];}
 return ['success'=>true,'tasks'=>$tasks,'accountDay'=>$age,'timezone'=>date_default_timezone_get(),'policy'=>'sequential; earliest account day; current-day approved deposits/valid bets'];
}
if($action==='status')Database::jsonResponse(bbMemberTasks($userId));
if($action!=='claim' || $_SERVER['REQUEST_METHOD']!=='POST')Database::errorResponse('Method Not Allowed',405);
$day=filter_var($input['day'] ?? null,FILTER_VALIDATE_INT);if($day===false || $day<1 || $day>12)Database::errorResponse('Invalid task',422);
$pdo=Database::getConnection();try{
 $pdo->beginTransaction();$user=Database::fetchOne("SELECT username,balance,status FROM users WHERE id=? FOR UPDATE",[$userId]);if(!$user || $user['status']!=='active')throw new RuntimeException('Active account required');
 $state=bbMemberTasks($userId);$task=$state['tasks'][$day-1];if(!$task['eligible'])throw new RuntimeException('কাজের দিন, পূর্বের দাবি অথবা আজকের শর্ত পূরণ হয়নি।');
 $bonus=$task['bonus'];$now=date('Y-m-d H:i:s');$reference='NM-'.$userId.'-'.$day;
 Database::insert('new_member_claims',['user_id'=>$userId,'day'=>$day,'bonus'=>$bonus,'claimed_at'=>$now]);
 Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$bonus,$userId]);Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$userId,'type'=>'bonus','amount'=>$bonus,'channel'=>'system','trx_id'=>$reference,'status'=>'success','description'=>'নতুন সদস্য কাজ '.$day,'created_at'=>$now]);
 $balance=Database::fetchOne('SELECT balance FROM users WHERE id=?',[$userId]);$pdo->commit();Database::jsonResponse(['success'=>true,'day'=>$day,'bonus'=>$bonus,'newBalance'=>(float)$balance['balance']]);
}catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'Claim could not be saved',400);}
