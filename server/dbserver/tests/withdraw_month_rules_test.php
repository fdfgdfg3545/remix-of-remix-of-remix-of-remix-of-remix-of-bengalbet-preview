<?php
require __DIR__.'/../api/withdraw_month.php';
class Database {
 static array $rows=[];
 static function fetchOne($sql,$p){
  if(!str_contains($sql,"type='deposit'") || !str_contains($sql,"status='success'") || !str_contains($sql,'amount>0') || !str_contains($sql,'COALESCE(processed_at,created_at)>=?') || !str_contains($sql,'COALESCE(processed_at,created_at)<?'))throw new RuntimeException('Monthly approval predicate incomplete');
  foreach(self::$rows as $r){$at=$r['processed_at']??$r['created_at'];if($r['user_id']===$p[0]&&$r['type']==='deposit'&&$r['status']==='success'&&$r['amount']>0&&$at>=$p[1]&&$at<$p[2])return ['id'=>'approved'];}return null;
 }
}
function testDeposit($r,$expected,$name){Database::$rows=[$r];if(bbWithdrawalHasMonthlyDeposit('owner')!==$expected)throw new RuntimeException($name);echo "$name passed\n";}
[$start,$end]=bbWithdrawalMonthBounds();
$r=['user_id'=>'owner','type'=>'deposit','status'=>'success','amount'=>500,'created_at'=>$start,'processed_at'=>$start];
testDeposit($r,true,'Positive approval exactly at month start qualifies');
testDeposit([...$r,'processed_at'=>(new DateTimeImmutable($start))->modify('-1 second')->format('Y-m-d H:i:s')],false,'Last month approval does not qualify');
testDeposit([...$r,'processed_at'=>$end],false,'Next month approval is excluded');
testDeposit([...$r,'created_at'=>(new DateTimeImmutable($start))->modify('-1 day')->format('Y-m-d H:i:s')],true,'Submitted last month approved this month qualifies');
testDeposit([...$r,'status'=>'pending'],false,'Pending deposit does not activate withdrawal');
testDeposit([...$r,'status'=>'rejected'],false,'Rejected deposit does not activate withdrawal');
testDeposit([...$r,'amount'=>0],false,'Zero deposit does not qualify');
testDeposit([...$r,'type'=>'bonus'],false,'Bonus cannot replace monthly deposit');
testDeposit([...$r,'user_id'=>'stranger'],false,'Another member deposit does not qualify');
testDeposit([...$r,'processed_at'=>null],true,'Legacy successful deposit uses documented created timestamp fallback');