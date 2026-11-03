<?php
require __DIR__.'/../api/reward_grants.php';
class Database {
 static bool $ownDeposit=false;static int $writes=0;
 static function fetchOne($sql,$p=[]){
  if(str_contains($sql,'FROM transactions'))return self::$ownDeposit?['id'=>'own-approved']:null;
  if(str_contains($sql,'FROM referrals'))return ['instant_bonus_paid'=>0,'total_deposit'=>1000,'total_bet'=>3000,'referrer_id'=>'referrer','id'=>'friend-ref','total_commission_earned'=>0,'referred_username'=>'friend'];
  if(str_contains($sql,'FROM users'))return ['id'=>'referrer','username'=>'referrer','phone'=>''];
  throw new RuntimeException('Unexpected query');
 }
 static function execute($sql,$p=[]){self::$writes++;return 1;}
 static function update($t,$r,$w,$p){self::$writes++;}
 static function insert($t,$r){self::$writes++;}
}
function rc($ok,$n){if(!$ok)throw new RuntimeException($n);echo "$n passed\n";}
rc(bbReferralQualify('friend')===0.0&&Database::$writes===0,'Friend 1000 deposit 3000 bet cannot pay never-deposited referrer');
bbLogReferralCommission('referrer',7,'deposit commission');bbLogReferralCommission('referrer',1,'bet commission');
rc(Database::$writes===0,'Both 7 deposit and 1 bet commissions blocked for never-deposited recipient');
try{bbGrantOnce('referrer','ref_level:1');throw new LogicException('Medal accepted');}catch(RuntimeException $e){rc(Database::$writes===0,'Medal reward blocked without own deposit');}
Database::$ownDeposit=true;
rc(bbReferralQualify('friend')===300.0&&Database::$writes===3,'Own approved deposit enables configured 300 qualifying reward');