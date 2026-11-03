<?php
require __DIR__.'/../api/mystery_cards.php';
require __DIR__.'/../api/withdraw_month.php';
require __DIR__.'/../api/turnover_math.php';
class MemoryConnection {
 private array $snapshot=[];private bool $open=false;
 function beginTransaction(){$this->snapshot=[Database::$balance,Database::$cards,Database::$ledger,Database::$grants];$this->open=true;}
 function inTransaction(){return $this->open;}function commit(){$this->open=false;}
 function rollBack(){[Database::$balance,Database::$cards,Database::$ledger,Database::$grants]=$this->snapshot;$this->open=false;}
}
class Database {
 static float $balance=100;static array $cards=[],$ledger=[],$grants=[];static bool $fail=false;static ?MemoryConnection $pdo=null;
 static function getConnection(){return self::$pdo??=new MemoryConnection();}
 static function fetchOne($sql,$p=[]){
  if(str_contains($sql,'promo_rules_config')||str_contains($sql,'mystery_reward_config'))return null;
  if(str_contains($sql,'FROM users'))return ['id'=>$p[0],'status'=>'active','balance'=>self::$balance];
  if(str_contains($sql,'mystery_cash_cards')){ $c=self::$cards[$p[0]]??null;return $c && $c['user_id']===$p[1]?$c:null; }
  throw new RuntimeException('Unexpected test query');
 }
 static function execute($sql,$p=[]){
  if(str_contains($sql,'reward_grants')){ $k=$p[0].'|'.$p[1];if(isset(self::$grants[$k]))return 0;self::$grants[$k]=true;return 1; }
  if(str_contains($sql,'UPDATE users')){self::$balance+=$p[0];return 1;}
  if(str_contains($sql,'UPDATE mystery_cash_cards')){self::$cards[$p[2]]['status']='claimed';return 1;}
  throw new RuntimeException('Unexpected test mutation');
 }
 static function insert($t,$r){if(self::$fail)throw new RuntimeException('Injected ledger failure');self::$ledger[]=$r;}
}
function check($ok,$name){if(!$ok)throw new RuntimeException($name);echo "$name passed\n";}
$c=bbValidateMystery([]);
check($c['minBonusAmount']===1000.0 && $c['maxBonusAmount']===50000.0 && $c['triggerDayOfMonth']===23 && $c['triggerHour']===18,'Shared mystery plan defaults');
check($c['autoCreditEnabled']===false && $c['wageringTurnover']===1.0,'Card only issuance uses common base wagering');
check(bbMysteryPeriod($c,'2026-11')===['period'=>'2026-11','start'=>'2026-11-01','cutoff'=>'2026-11-23','due'=>'2026-11-23 18:00:00'],'Mystery default 1 to 22 betting cutoff and 23 at 18 due');
$first=bbMysteryPeriod([...$c,'triggerDayOfMonth'=>1],'2026-12');check($first['start']===$first['cutoff'],'First-day trigger has empty pre-trigger betting interval');
check(bbWithdrawalMonthBounds(new DateTimeImmutable('2026-11-30 18:00:00',new DateTimeZone('UTC')))===['2026-12-01 00:00:00','2027-01-01 00:00:00'],'Withdrawal month rollover uses Dhaka not UTC');
for($i=0;$i<60;$i++){
 $date=(new DateTimeImmutable('2026-11-01',new DateTimeZone('Asia/Dhaka')))->modify("+$i days");
 $p=bbMysteryPeriod($c,$date->format('Y-m'));
 check(substr($p['due'],0,7)===$date->format('Y-m'),'60-day period stays in qualifying month '.$i);
}
Database::$cards['mcc-test']=['id'=>'mcc-test','user_id'=>'owner','month_year'=>'2026-11','bonus_amount'=>2500,'status'=>'unlocked','eligible'=>1,'ticket_code'=>'MYS-test','unlocked_at'=>'2026-11-23 18:00:00'];
check(Database::$balance===100.0 && count(Database::$ledger)===0,'Issuing a card does not credit cash');
try{bbMysteryRedeem('stranger','mcc-test');throw new LogicException('Foreign card accepted');}catch(RuntimeException $e){check(Database::$balance===100.0,'Foreign card denied without credit');}
Database::$fail=true;
try{bbMysteryRedeem('owner','mcc-test');throw new LogicException('Expected failure');}catch(RuntimeException $e){check(Database::$balance===100.0 && Database::$cards['mcc-test']['status']==='unlocked' && count(Database::$grants)===0,'Ledger failure rolls back cash card and grant');}
Database::$fail=false;$r=bbMysteryRedeem('owner','mcc-test');
check($r['newBalance']===2600.0 && $r['turnoverRequired']===2500.0 && count(Database::$ledger)===1,'Redeem 2500 card credits exactly 2500 and 1x once');
check(bbTurnoverRequired(bbPromoRules()['withdrawal'],0,0,0,2500)===2500.0,'Redeemed card contributes 2500 common wagering');
try{bbMysteryRedeem('owner','mcc-test');throw new LogicException('Duplicate accepted');}catch(RuntimeException $e){check(Database::$balance===2600.0 && count(Database::$ledger)===1,'Duplicate card cannot credit twice');}