<?php
require_once __DIR__.'/bonus_eligibility.php';
/** Calendar anniversary, clamped to the destination month's last day, in Dhaka. */
function bbDepositExpiry(string $approvedAt): string {
    $d=new DateTimeImmutable($approvedAt,new DateTimeZone('Asia/Dhaka'));
    $next=$d->modify('first day of next month');
    return $next->setDate((int)$next->format('Y'),(int)$next->format('n'),min((int)$d->format('j'),(int)$next->format('t')))->format('Y-m-d H:i:s');
}
function bbActivationView(?array $s,bool $lifetime): array {
    $target=(float)($s['target_amount']??0);$paid=(float)($s['deposited_amount']??0);
    $remaining=round(max(0,$target-$paid),2);
    return ['hasLifetimeDeposit'=>$lifetime,'restricted'=>!$lifetime||(!empty($s['restricted_at'])&&$remaining>0),'targetAmount'=>$target,'depositedAmount'=>$paid,'remainingDeposit'=>$remaining,'restrictedAt'=>$s['restricted_at']??null,'observedAt'=>$s['observed_at']??null,'expiresAt'=>$s?bbDepositExpiry($s['anchor_at']):null];
}
/** Caller owns the member lock. Snapshot before mutations; persist even on denied withdrawal. */
function bbActivationCheck(array $user,?string $now=null): array {
    $uid=$user['id'];$now=$now??date('Y-m-d H:i:s');
    $last=Database::fetchOne("SELECT COALESCE(processed_at,created_at) approved_at FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND amount>0 ORDER BY COALESCE(processed_at,created_at) DESC,id DESC LIMIT 1",[$uid]);
    if(!$last)return bbActivationView(null,false);
    $s=Database::fetchOne('SELECT * FROM withdrawal_activation WHERE user_id=? FOR UPDATE',[$uid]);
    if(!$s){
        $s=['user_id'=>$uid,'anchor_at'=>$last['approved_at'],'restricted_at'=>null,'observed_at'=>null,'target_amount'=>0,'deposited_amount'=>0,'reopened_at'=>null];
        Database::insert('withdrawal_activation',$s);
    }
    if(empty($s['restricted_at'])){
        // New deposits reset only an unrestricted anchor; partial restricted deposits never do.
        if($last['approved_at']>$s['anchor_at'])$s['anchor_at']=$last['approved_at'];
        $expiry=bbDepositExpiry($s['anchor_at']);
        if($now>=$expiry){
            $s['restricted_at']=$expiry;$s['observed_at']=$now;
            $s['target_amount']=round(max(0,(float)$user['balance']),2);$s['deposited_amount']=0;
        }
        Database::update('withdrawal_activation',$s,'user_id=?',[$uid]);
    }
    return bbActivationView($s,true);
}
/** Call before crediting a newly-approved principal, while member lock is held. */
function bbActivationApprove(array $user,float $amount,?string $now=null): void {
    $now=$now??date('Y-m-d H:i:s');$uid=$user['id'];
    $v=bbActivationCheck($user,$now);
    $s=Database::fetchOne('SELECT * FROM withdrawal_activation WHERE user_id=? FOR UPDATE',[$uid]);
    if(!$s){
        Database::insert('withdrawal_activation',['user_id'=>$uid,'anchor_at'=>$now,'target_amount'=>0,'deposited_amount'=>0]);return;
    }
    if(!empty($s['restricted_at'])){
        $s['deposited_amount']=round((float)$s['deposited_amount']+$amount,2);
        if($s['deposited_amount']+0.00001>=(float)$s['target_amount']){
            $s['restricted_at']=null;$s['anchor_at']=$now;$s['reopened_at']=$now;
        }
    }else $s['anchor_at']=$now;
    Database::update('withdrawal_activation',$s,'user_id=?',[$uid]);
}