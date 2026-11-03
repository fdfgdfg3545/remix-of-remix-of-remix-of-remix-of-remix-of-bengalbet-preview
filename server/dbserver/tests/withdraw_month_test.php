<?php
// Exercise the actual submission guard without a database; no shared money is touched.
class Reply extends RuntimeException { public array $payload; public function __construct(array $p){parent::__construct($p['message']??'');$this->payload=$p;} }
class FakeConnection { private bool $open=false; function beginTransaction(){$this->open=true;} function inTransaction(){return $this->open;} function commit(){$this->open=false;} function rollBack(){$this->open=false;} }
class Database {
 static bool $deposit=false; static int $writes=0; static ?FakeConnection $pdo=null; static ?array $activation=null;
 static function getConnection(){return self::$pdo??=new FakeConnection();}
 static function fetchOne($sql,$params=[]){
  if(str_contains($sql,'site_settings'))return ['min_withdraw'=>500,'max_withdraw'=>25000,'maintenance_mode'=>0];
  if(str_contains($sql,'SELECT * FROM users'))return ['id'=>'isolated','status'=>'active','balance'=>1000,'username'=>'test','phone'=>''];
  if(str_contains($sql,"type='deposit'"))return self::$deposit?['id'=>'dep-current','approved_at'=>date('Y-m-d H:i:s')]:null;
  if(str_contains($sql,'withdrawal_activation'))return self::$activation;
  if(str_contains($sql,"type='withdraw'"))return null;
  if(str_contains($sql,'SELECT balance'))return ['balance'=>500];
  throw new RuntimeException('Unexpected query');
 }
 static function insert($table,$row){if($table==='withdrawal_activation'){self::$activation=$row;return;}self::$writes++;} static function execute($sql,$p=[]){self::$writes++;}
 static function update($t,$row,$w,$p){self::$activation=$row;}
 static function jsonResponse($p){if(!empty($p['success'])){if(self::$writes!==2)throw new RuntimeException('Wrong financial writes');echo "Approved current-month deposit allows submission passed\n";exit(0);}throw new Reply($p);} static function errorResponse($m,$c){throw new Reply(['success'=>false,'message'=>$m,'status'=>$c]);}
}
function bbTurnoverStatus($uid){return ['remaining'=>0];}
$action='withdraw';$method='POST';$userId='isolated';$input=['amount'=>500,'walletType'=>'bkash','accountNumber'=>'test-destination'];
try {require __DIR__.'/../api/withdraw_guard.php';}catch(Reply $r){$result=$r->payload;}
if(($result['success']??true)!==false || ($result['message']??'')!=='Deposit first to activate your withdrawal' || Database::$writes!==0)throw new RuntimeException('No current-month deposit must reject submission before balance/transaction writes');
echo "No lifetime deposit blocks submission without financial writes passed\n";
Database::$deposit=true;
try {require __DIR__.'/../api/withdraw_guard.php';}catch(Reply $r){$result=$r->payload;}
if(empty($result['success'])||Database::$writes!==2)throw new RuntimeException('Recent approved deposit should allow otherwise eligible withdrawal');
echo "Approved current-month deposit allows submission passed\n";