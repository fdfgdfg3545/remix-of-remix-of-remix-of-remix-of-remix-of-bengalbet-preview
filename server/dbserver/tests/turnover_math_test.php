<?php
require __DIR__.'/../api/turnover_math.php';
$w=['enabled'=>true,'depositTurnover'=>1,'depositBonusTurnover'=>8];
function assertAmount($actual,$expected,$label){if($actual!==$expected)throw new RuntimeException($label);echo "$label passed\n";}
assertAmount(bbTurnoverRequired($w,1000,470,470,0),5230.0,'First bonus base plus extra is nine times');
assertAmount(bbTurnoverRequired($w,500,50,0,100),650.0,'Later deposit bonus and all ordinary credits base one');
assertAmount(bbTurnoverRequired(['enabled'=>true,'depositTurnover'=>2,'depositBonusTurnover'=>3],1000,470,470,100),4550.0,'Admin multipliers independent');
assertAmount(bbBalanceAdjustment(90,100,'set')['amount'],10.0,'Set ledger positive delta only');
assertAmount(bbBalanceAdjustment(200,100,'set')['type'],'adjustment','Decrease is not a bonus');