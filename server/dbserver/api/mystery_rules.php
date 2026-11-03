<?php
/** Single mystery authority shared by admin, public terms and scheduled issuance. */
function bbMysteryDefaults(): array {
    return ['enabled'=>true,'minBonusAmount'=>1000,'maxBonusAmount'=>50000,'triggerDayOfMonth'=>23,'triggerHour'=>18,'minBetRequired'=>500,'promoCode'=>'','wageringTurnover'=>1,'autoCreditEnabled'=>false];
}
function bbValidateMystery(array $input): array {
    $c=array_merge(bbMysteryDefaults(),$input);
    if(!is_bool($c['enabled']))throw new InvalidArgumentException('Enabled must be boolean');
    foreach(['triggerDayOfMonth'=>[1,28],'triggerHour'=>[0,23]] as $k=>$range){
        if(filter_var($c[$k],FILTER_VALIDATE_INT)===false || $c[$k]<$range[0] || $c[$k]>$range[1])throw new InvalidArgumentException('Invalid mystery schedule');
        $c[$k]=(int)$c[$k];
    }
    foreach(['minBonusAmount','maxBonusAmount','minBetRequired'] as $k){
        if(!is_numeric($c[$k]) || !is_finite((float)$c[$k]) || $c[$k]<0 || $c[$k]>1000000000)throw new InvalidArgumentException('Invalid mystery amount');
        $c[$k]=round((float)$c[$k],2);
    }
    if($c['minBonusAmount']<=0 || $c['maxBonusAmount']<$c['minBonusAmount'])throw new InvalidArgumentException('Invalid mystery prize range');
    $c['promoCode']=substr(trim((string)$c['promoCode']),0,64);
    // Legacy fields cannot enable direct wallet credits or a second wagering multiplier.
    $c['autoCreditEnabled']=false;
    $c['wageringTurnover']=(float)bbPromoRules()['withdrawal']['depositTurnover'];
    return array_intersect_key($c,bbMysteryDefaults());
}
function bbMysteryConfig(): array {
    $row=Database::fetchOne('SELECT config_json FROM mystery_reward_config WHERE id=1');
    return bbValidateMystery($row?(json_decode($row['config_json'],true)?:[]):[]);
}
function bbMysteryPeriod(array $config,string $month): array {
    $start=new DateTimeImmutable($month.'-01 00:00:00',new DateTimeZone('Asia/Dhaka'));
    $cutoff=$start->modify('+'.((int)$config['triggerDayOfMonth']-1).' days');
    return ['period'=>$start->format('Y-m'),'start'=>$start->format('Y-m-d'),'cutoff'=>$cutoff->format('Y-m-d'),'due'=>$cutoff->setTime((int)$config['triggerHour'],0,0)->format('Y-m-d H:i:s')];
}