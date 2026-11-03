<?php
require __DIR__.'/../api/vip_salary.php';
function checkSalary($ok,$label){if(!$ok)throw new RuntimeException($label);echo "$label passed\n";}
$v=['weeklyClaimDay'=>1,'monthlyClaimDay'=>1];
checkSalary(bbSalaryPeriods($v,'2026-11-02')===[['type'=>'weekly','period'=>'2026-11-02']],'Monday weekly period');
checkSalary(bbSalaryPeriods($v,'2026-11-01')===[['type'=>'monthly','period'=>'2026-11']],'First monthly period');
checkSalary(bbSalaryPeriods($v,'2026-11-03')===[],'No off-day salary');
checkSalary(count(bbSalaryPeriods($v,'2027-02-01'))===2,'Weekly and monthly coexist');
checkSalary(bbSalaryPeriods(['weeklyClaimDay'=>2,'monthlyClaimDay'=>3],'2026-11-03')===[['type'=>'weekly','period'=>'2026-11-02'],['type'=>'monthly','period'=>'2026-11']],'Admin changed schedule');
$r=['id'=>'vips-test','vip_level'=>1,'reward_type'=>'weekly','amount'=>20,'status'=>'active','claimed_at'=>null,'created_at'=>'2026-11-02 00:00:00','period_key'=>'2026-11-02'];
checkSalary(bbSalaryCardView($r)['amount']===20.0 && bbSalaryCardView($r)['targetAction']==='vip_salary','Card preserves configured amount not example');