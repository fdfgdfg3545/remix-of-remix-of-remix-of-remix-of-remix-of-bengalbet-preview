<?php
require __DIR__ . '/../api/cron_engine.php';
require __DIR__ . '/../api/promo_rules.php';
function check($condition, $name) { if (!$condition) throw new RuntimeException($name); echo "$name passed\n"; }
$r = bbPromoRulesDefaults(); $m = ['enabled'=>true,'triggerDayOfMonth'=>23,'triggerHour'=>18];
$ts = fn($s) => (new DateTimeImmutable($s, new DateTimeZone('Asia/Dhaka')))->getTimestamp();
check(bbCronWindows($r,$m,$ts('2026-11-03 12:00:00'))['redPacket'], 'Packet starts at scheduled minute');
check(!bbCronWindows($r,$m,$ts('2026-11-03 12:30:00'))['redPacket'], 'Packet closes at 30 minutes');
check(!bbCronWindows($r,$m,$ts('2026-11-03 10:00:00'))['rescue'], 'Rescue closes at 10');
check(bbCronWindows($r,$m,$ts('2026-11-03 09:00:00'))['slotDaily'], 'Slot opens at 9');
check(bbCronWindows($r,$m,$ts('2026-11-23 18:00:00'))['mystery'], 'Mystery starts at configured time');
check(!bbCronWindows($r,$m,$ts('2026-11-24 18:00:00'))['mystery'], 'Mystery stays closed next day');
check(bbCronWindows($r,$m,$ts('2026-11-02 00:00:00'))['vipWeekly'], 'VIP Monday');
check(bbCronWindows($r,$m,$ts('2026-11-01 00:00:00'))['vipMonthly'], 'VIP first of month');
check(bbCronWindows($r,$m,$ts('2026-11-13 00:00:00'))['memberDay'], 'Member day 13');
$r['redPacket']['hours']=[7]; check(bbCronWindows($r,$m,$ts('2026-11-03 07:00:00'))['redPacket'], 'Changed admin hour respected');
$r['redPacket']['enabled']=false; check(!bbCronWindows($r,$m,$ts('2026-11-03 07:00:00'))['redPacket'], 'Disabled packet respected');
check(!bbCronAuthorized('',null), 'Unconfigured HTTP fails closed');
$key=bin2hex(random_bytes(32));$hash=password_hash($key,PASSWORD_DEFAULT);
check(bbCronAuthorized($key,$hash) && !bbCronAuthorized(bin2hex(random_bytes(32)),$hash), 'Dedicated key authentication');
$committed=[];$cursor='';
$commit=function($id,$data)use(&$committed,&$cursor){$committed[$id]=$data;$cursor=$id;};
try { bbCronProcessBatch(['a','b','c'],fn($id)=>$id==='b' ? throw new RuntimeException('interrupted') : $id,$commit,microtime(true)+5); }catch(RuntimeException $e){}
check($cursor==='a' && count($committed)===1,'Failure preserves checkpoint');
bbCronProcessBatch(['b','c'],fn($id)=>$id,$commit,microtime(true)+5);
check($cursor==='c' && count($committed)===3,'Next call resumes remaining work');
check(bbCronProcessBatch(['d'],fn($id)=>$id,$commit,microtime(true)-1)===0 && $cursor==='c','Budget stops without losing work');