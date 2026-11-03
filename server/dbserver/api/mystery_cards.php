<?php
require_once __DIR__.'/promo_rules.php';
require_once __DIR__.'/mystery_rules.php';
require_once __DIR__.'/reward_grants.php';
function bbMysteryTicket(array $r): array {
    $name='রহস্যময় নগদ কার্ড '.$r['month_year'];
    return ['id'=>$r['id'],'name'=>$name,'productName'=>$name,'type'=>'mystery_cash','category'=>'mystery_cash','targetAction'=>'mystery_cash','amount'=>(float)$r['bonus_amount'],'bonusAmount'=>'৳ '.number_format((float)$r['bonus_amount'],2),'redeemCode'=>$r['ticket_code'],'status'=>$r['status']==='claimed'?'claimed':(!empty($r['eligible'])&&$r['status']==='unlocked'?'active':'locked'),'date'=>$r['unlocked_at'],'receivedAt'=>$r['unlocked_at'],'dateCategory'=>'older','period'=>$r['month_year']];
}
function bbMysteryPrepare(array $config,string $now): void {
    $pdo=Database::getConnection();$pdo->beginTransaction();
    try {
        $clock=Database::fetchOne('SELECT checked_month FROM mystery_card_clock WHERE id=1 FOR UPDATE');
        if(!$clock)throw new RuntimeException('Mystery scheduler schema is not installed');
        $month=$clock['checked_month'];$current=substr($now,0,7);$count=0;
        while($month<=$current && $count++<12){
            $p=bbMysteryPeriod($config,$month);
            if($p['due']>$now)break;
            if(!empty($config['enabled'])){
                $upper=Database::fetchOne('SELECT MAX(id) upper_id FROM users WHERE created_at<=?',[$p['due']])['upper_id']??'';
                Database::execute('INSERT IGNORE INTO mystery_card_jobs (id,period_key,due_at,config_json,upper_id) VALUES (?,?,?,?,?)',['mystery:'.$month,$month,$p['due'],json_encode($config),$upper]);
            }
            // Keep current month re-checkable; unique period prevents duplicate issuance.
            if($month===$current)break;
            $month=(new DateTimeImmutable($month.'-01'))->modify('+1 month')->format('Y-m');
        }
        Database::execute('UPDATE mystery_card_clock SET checked_month=? WHERE id=1',[$month]);$pdo->commit();
    }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
}
function bbMysteryProcess(float $deadline): int {
    $pdo=Database::getConnection();$done=0;
    while($done<25 && microtime(true)<$deadline){
        $job=Database::fetchOne('SELECT * FROM mystery_card_jobs WHERE complete=0 ORDER BY due_at,id LIMIT 1');if(!$job)break;
        $next=Database::fetchOne('SELECT id FROM users WHERE id>? AND id<=? AND created_at<=? ORDER BY id LIMIT 1',[$job['cursor_id'],$job['upper_id'],$job['due_at']]);
        if(!$next){Database::execute('UPDATE mystery_card_jobs SET complete=1 WHERE id=?',[$job['id']]);continue;}
        $pdo->beginTransaction();
        try {
            $uid=$next['id'];$u=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$uid]);
            $c=json_decode($job['config_json'],true);if(!is_array($c))throw new RuntimeException('Invalid saved mystery rules');
            $p=bbMysteryPeriod($c,$job['period_key']);
            $bet=(float)Database::fetchOne('SELECT COALESCE(SUM(bet_amount),0) total FROM bets WHERE user_id=? AND date>=? AND date<?',[$uid,$p['start'],$p['cutoff']])['total'];
            $old=Database::fetchOne('SELECT id FROM mystery_cash_cards WHERE user_id=? AND month_year=?',[$uid,$job['period_key']]);
            if($u && $u['status']==='active' && $bet>=(float)$c['minBetRequired'] && !$old){
                $amount=random_int((int)round($c['minBonusAmount']*100),(int)round($c['maxBonusAmount']*100))/100;
                Database::insert('mystery_cash_cards',['id'=>'mcc-'.bin2hex(random_bytes(12)),'user_id'=>$uid,'username'=>$u['username'],'month_year'=>$job['period_key'],'bonus_amount'=>$amount,'status'=>'unlocked','eligible'=>1,'user_bet_amount'=>$bet,'turnover_required'=>0,'turnover_completed'=>0,'ticket_code'=>'MYS-'.strtoupper(bin2hex(random_bytes(12))),'unlocked_at'=>date('Y-m-d H:i:s'),'claimed_at'=>null]);
            }
            Database::execute('UPDATE mystery_card_jobs SET cursor_id=? WHERE id=?',[$uid,$job['id']]);$pdo->commit();$done++;
        }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
    }
    return $done;
}
function bbMysteryRedeem(string $uid,string $id): array {
    $pdo=Database::getConnection();$pdo->beginTransaction();
    try {
        $u=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$uid]);
        if(!$u || $u['status']!=='active')throw new RuntimeException('সক্রিয় সদস্য প্রয়োজন।');
        if(empty(bbMysteryConfig()['enabled']))throw new RuntimeException('রহস্য পুরস্কার এখন বন্ধ।');
        $c=Database::fetchOne('SELECT * FROM mystery_cash_cards WHERE id=? AND user_id=? FOR UPDATE',[$id,$uid]);
        if(!$c || $c['status']!=='unlocked' || empty($c['eligible']))throw new RuntimeException('কার্ড নেই, অযোগ্য অথবা ইতিমধ্যে গ্রহণ করেছেন।');
        $amount=(float)$c['bonus_amount'];if(!is_finite($amount)||$amount<=0)throw new RuntimeException('কার্ডের অঙ্ক সঠিক নয়।');
        if(!bbGrantOnce($uid,'mystery:'.$c['month_year']))throw new RuntimeException('এই মাসের রহস্য পুরস্কার ইতিমধ্যে গ্রহণ করেছেন।');
        $w=bbPromoRules()['withdrawal'];$required=empty($w['enabled'])?0:round($amount*(float)$w['depositTurnover'],2);
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$amount,$uid]);
        Database::insert('transactions',['id'=>'tx-'.bin2hex(random_bytes(12)),'user_id'=>$uid,'type'=>'bonus','amount'=>$amount,'status'=>'success','channel'=>'system','trx_id'=>$id,'description'=>'রহস্য পুরস্কার '.$c['month_year'],'created_at'=>date('Y-m-d H:i:s')]);
        Database::execute("UPDATE mystery_cash_cards SET status='claimed',claimed_at=?,turnover_required=? WHERE id=?",[date('Y-m-d H:i:s'),$required,$id]);
        $pdo->commit();return ['success'=>true,'message'=>'রহস্য নগদ কার্ড একবার ব্যালেন্সে যোগ হয়েছে।','bonusAmount'=>$amount,'turnoverRequired'=>$required,'newBalance'=>round((float)$u['balance']+$amount,2)];
    }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
}