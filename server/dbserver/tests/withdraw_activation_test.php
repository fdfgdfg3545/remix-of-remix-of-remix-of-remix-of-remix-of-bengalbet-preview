<?php
require __DIR__.'/../api/withdraw_activation.php';
class Database {
 static ?array $state=null;static ?string $last='2026-10-03 08:30:00';
 static function fetchOne($sql,$p=[]){
  if(str_contains($sql,'FROM transactions'))return self::$last?(str_contains($sql,'approved_at')?['approved_at'=>self::$last]:['id'=>'deposit']):null;
  if(str_contains($sql,'withdrawal_activation'))return self::$state;
  throw new RuntimeException('Unexpected query');
 }
 static function insert($t,$row){self::$state=$row;}
 static function update($t,$row,$where,$p){self::$state=array_merge(self::$state??[],$row);}
}
function ck($v,$name){if(!$v)throw new RuntimeException($name);echo "$name passed\n";}
ck(bbDepositExpiry('2026-11-15 08:30:00')==='2026-12-15 08:30:00','One calendar month not calendar rollover');
ck(bbDepositExpiry('2027-01-31 08:30:00')==='2027-02-28 08:30:00','Month-end clamp');
ck(bbDepositExpiry('2028-01-31 08:30:00')==='2028-02-29 08:30:00','Leap month clamp');
$u=['id'=>'member','balance'=>5000];
ck(!bbActivationCheck($u,'2026-11-03 08:29:59')['restricted'],'Before expiry unrestricted');
$v=bbActivationCheck($u,'2026-11-03 08:30:00');
ck($v['restricted']&&$v['targetAmount']===5000.0,'Exact expiry freezes full 5000 balance');
bbActivationApprove($u,2000,'2026-11-03 09:00:00');Database::$last='2026-11-03 09:00:00';
$v=bbActivationCheck(['id'=>'member','balance'=>7000],'2026-11-04 09:00:00');
ck($v['restricted']&&$v['remainingDeposit']===3000.0,'Partial 2000 deposit leaves 3000 no timer reset');
$v=bbActivationCheck(['id'=>'member','balance'=>100],'2026-11-05 09:00:00');
ck($v['targetAmount']===5000.0&&$v['remainingDeposit']===3000.0,'Later loss does not lower fixed target');
bbActivationApprove(['id'=>'member','balance'=>100],3000,'2026-11-05 10:00:00');
ck(!bbActivationView(Database::$state,true)['restricted']&&Database::$state['anchor_at']==='2026-11-05 10:00:00','Cumulative 5000 reactivates with new anchor');
Database::$last=null;Database::$state=null;
ck(bbActivationCheck($u)['restricted'],'Never deposited cannot withdraw');
try{bbRequireBonusDeposit('member');throw new LogicException('Bonus permitted');}catch(RuntimeException $e){ck(Database::$state===null,'No lifetime deposit bonus rejected without writes');}
Database::$last='2026-11-03 10:00:00';bbRequireBonusDeposit('member');ck(bbHasLifetimeDeposit('member'),'Approved first deposit enables bonuses');