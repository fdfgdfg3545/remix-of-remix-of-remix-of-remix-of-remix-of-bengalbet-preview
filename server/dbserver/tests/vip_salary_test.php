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
checkSalary(bbSalaryCardView($r)['amount']===20.0 && bbSalaryCardView($r)['targetAction']==='vip_salary','Card preserves configured amount not example');// v8: site copy says the monthly salary arrives on the 1st at 15:00; weekly on Monday at 00:00.
checkSalary(bbSalaryDueAt(['monthlyHour'=>15],'monthly','2026-12-01')==='2026-12-01 15:00:00','Monthly card due at 15:00');
checkSalary(bbSalaryDueAt([],'monthly','2026-12-01')==='2026-12-01 15:00:00','Monthly default hour 15');
checkSalary(bbSalaryDueAt(['monthlyHour'=>15],'weekly','2026-11-09')==='2026-11-09 00:00:00','Weekly card due at midnight');
