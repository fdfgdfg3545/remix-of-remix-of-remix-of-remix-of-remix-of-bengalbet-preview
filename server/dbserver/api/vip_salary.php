<?php
require_once __DIR__ . "/bonus_eligibility.php";
/** Durable salary cards: issuance never credits wallet; redemption does, once. */
function bbSalaryPeriods(array $vip, string $day): array {
    $date = new DateTimeImmutable($day, new DateTimeZone('Asia/Dhaka'));
    $out = [];
    if ((int)$date->format('N') === (int)$vip['weeklyClaimDay']) $out[] = ['type'=>'weekly','period'=>$date->modify('monday this week')->format('Y-m-d')];
    if ((int)$date->format('j') === (int)$vip['monthlyClaimDay']) $out[] = ['type'=>'monthly','period'=>$date->format('Y-m')];
    return $out;
}
/** Due time in Bangladesh time: weekly at 00:00, monthly at the configured hour (site copy: 15:00). */
function bbSalaryDueAt(array $vip, string $type, string $day): string {
    $h = $type==='monthly' ? max(0,min(23,(int)($vip['monthlyHour'] ?? 15))) : 0;
    return $day.' '.str_pad((string)$h,2,'0',STR_PAD_LEFT).':00:00';
}
function bbSalaryCardView(array $row): array {
    $name='VIP'.$row['vip_level'].' '.($row['reward_type']==='weekly' ? 'সাপ্তাহিক' : 'মাসিক').' নগদ কার্ড';
    return ['id'=>$row['id'],'name'=>$name,'productName'=>$name,'type'=>'vip_salary','category'=>'vip_salary','targetAction'=>'vip_salary','amount'=>(float)$row['amount'],'bonusAmount'=>'৳ '.number_format((float)$row['amount'],2),'redeemCode'=>$row['id'],'status'=>$row['status'],'claimedAt'=>$row['claimed_at'],'receivedAt'=>$row['created_at'],'date'=>$row['created_at'],'dateCategory'=>substr($row['created_at'],0,10)===date('Y-m-d')?'today':(substr($row['created_at'],0,10)===date('Y-m-d',strtotime('-1 day'))?'yesterday':'older'),'period'=>$row['period_key']];
}
function bbSalaryPrepare(array $live, string $today): void {
    $pdo=Database::getConnection(); $pdo->beginTransaction();
    try {
        $clock=Database::fetchOne('SELECT checked_date FROM vip_salary_clock WHERE id=1 FOR UPDATE');
        if (!$clock) throw new RuntimeException('VIP salary schema is not installed');
        $day=$clock['checked_date']; $count=0;
        // Catch-up is bounded and persisted; another minute continues long downtime.
        while ($day<=$today && $count++<31) {
            foreach(bbSalaryPeriods($live['promoRules']['vip'],$day) as $p) {
                $upper=Database::fetchOne("SELECT MAX(id) upper_id FROM users WHERE status='active' AND created_at<=?",[$day.' 00:00:00'])['upper_id']??'';
                $due=bbSalaryDueAt($live['promoRules']['vip'],$p['type'],$day);
                Database::execute('INSERT IGNORE INTO vip_salary_jobs (id,reward_type,period_key,due_at,tiers_json,upper_id) VALUES (?,?,?,?,?,?)', ['salary:'.$p['type'].':'.$p['period'],$p['type'],$p['period'],$due,json_encode($live['vipTiers']),$upper]);
            }
            if($day===$today) break;
            $day=(new DateTimeImmutable($day))->modify('+1 day')->format('Y-m-d');
        }
        Database::execute('UPDATE vip_salary_clock SET checked_date=? WHERE id=1',[$day]); $pdo->commit();
    } catch(Throwable $e) { if($pdo->inTransaction())$pdo->rollBack(); throw $e; }
}
function bbSalaryProcess(float $deadline): int {
    $pdo=Database::getConnection(); $done=0;
    while($done<25 && microtime(true)<$deadline) {
        $job=Database::fetchOne('SELECT * FROM vip_salary_jobs WHERE complete=0 AND due_at<=? ORDER BY due_at,id LIMIT 1',[date('Y-m-d H:i:s')]);
        if(!$job) break;
        $next=Database::fetchOne("SELECT id FROM users WHERE id>? AND id<=? AND created_at<=? ORDER BY id LIMIT 1",[$job['cursor_id'],$job['upper_id'],$job['due_at']]);
        if(!$next) { Database::execute('UPDATE vip_salary_jobs SET complete=1 WHERE id=?',[$job['id']]); continue; }
        $uid=$next['id'];
        $pdo->beginTransaction();
        try {
            $user=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$uid]);
            $tiers=json_decode($job['tiers_json'],true)?:[];
            $tier=null; foreach($tiers as $t) if((int)$t['level']===(int)$user['vip_level'])$tier=$t;
            $amount=$tier ? (float)($tier[$job['reward_type'].'Bonus']??0) : 0;
            $legacy=Database::fetchOne('SELECT id FROM vip_claims WHERE user_id=? AND type=? AND date>=? AND date<? LIMIT 1',[$uid,$job['reward_type'],$job['reward_type']==='weekly'?$job['period_key']:$job['period_key'].'-01',(new DateTimeImmutable($job['reward_type']==='weekly'?$job['period_key']:$job['period_key'].'-01'))->modify($job['reward_type']==='weekly'?'+7 days':'+1 month')->format('Y-m-d')]);
            if($user['status']==='active' && (int)$user['vip_level']>0 && $amount>0 && !$legacy && bbHasLifetimeDeposit($uid)) {
                Database::execute('INSERT IGNORE INTO vip_salary_cards (id,user_id,reward_type,period_key,vip_level,amount,created_at) VALUES (?,?,?,?,?,?,?)',['vips-'.bin2hex(random_bytes(12)),$uid,$job['reward_type'],$job['period_key'],(int)$user['vip_level'],round($amount,2),date('Y-m-d H:i:s')]);
            }
            Database::execute('UPDATE vip_salary_jobs SET cursor_id=? WHERE id=?',[$uid,$job['id']]);
            $pdo->commit(); $done++;
        } catch(Throwable $e) {if($pdo->inTransaction())$pdo->rollBack();throw $e;}
    }
    return $done;
}
function bbSalaryRedeem(string $uid,string $id): array {
    $pdo=Database::getConnection();$pdo->beginTransaction();
    try {
        $u=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$uid]);
        if(!$u || $u['status']!=='active')throw new RuntimeException('সক্রিয় সদস্য প্রয়োজন।');
        bbRequireBonusDeposit($uid);
        $c=Database::fetchOne('SELECT * FROM vip_salary_cards WHERE id=? AND user_id=? FOR UPDATE',[$id,$uid]);
        if(!$c || $c['status']!=='active')throw new RuntimeException('কার্ড নেই অথবা ইতিমধ্যে গ্রহণ করেছেন।');
        $amount=(float)$c['amount'];if(!is_finite($amount)||$amount<=0)throw new RuntimeException('কার্ডের অঙ্ক সঠিক নয়।');
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$amount,$uid]);
        Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$uid,'type'=>'bonus','amount'=>$amount,'status'=>'success','channel'=>'system','trx_id'=>$id,'description'=>bbSalaryCardView($c)['name'].' '.$c['period_key'],'created_at'=>date('Y-m-d H:i:s')]);
        Database::execute("UPDATE vip_salary_cards SET status='claimed',claimed_at=? WHERE id=?",[date('Y-m-d H:i:s'),$id]);
        $pdo->commit(); return ['success'=>true,'message'=>'VIP নগদ কার্ড একবার ব্যালেন্সে যোগ হয়েছে।','bonusAmount'=>$amount,'newBalance'=>round((float)$u['balance']+$amount,2)];
    } catch(Throwable $e) {if($pdo->inTransaction())$pdo->rollBack();throw $e;}
}