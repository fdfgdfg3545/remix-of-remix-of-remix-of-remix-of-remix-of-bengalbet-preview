<?php
class Database {
    public static array $tx=['id'=>'audit','user_id'=>'test','type'=>'withdraw','amount'=>500,'status'=>'pending'];
    public static float $balance=17;
    public static function fetchOne($sql,$args){return str_contains($sql,'transactions')?self::$tx:['id'=>'test'];}
    public static function execute($sql,$args){self::$balance+=$args[0];}
    public static function update($table,$row,$where,$args){self::$tx=array_merge(self::$tx,$row);}
}
function bbApproveDeposit(array $tx): void { Database::$balance+=(float)$tx['amount']+(float)($tx['bonus']??0); }
$section='test';$action='test';require __DIR__.'/../api/money_guard.php';
function check($value,$message){if(!$value)throw new RuntimeException($message);}
bbSettlePendingMoney('audit','rejected',[]);check(Database::$balance===517.0,'Withdrawal refund must add 500 once');
bbSettlePendingMoney('audit','rejected',[]);check(Database::$balance===517.0,'Repeated rejection must not add money');
$denied=false;try{bbSettlePendingMoney('audit','success',[]);}catch(RuntimeException $e){$denied=true;}check($denied,'Rejected payment cannot become successful');
Database::$tx=['id'=>'audit','user_id'=>'test','type'=>'deposit','amount'=>200,'bonus'=>10,'status'=>'pending'];
bbSettlePendingMoney('audit','success',[]);check(Database::$balance===727.0,'Deposit plus stored bonus must credit 210');
bbSettlePendingMoney('audit','success',[]);check(Database::$balance===727.0,'Repeated approval must not add money');
echo "Five payment transition assertions passed\n";