<?php
/** Deposit offer rules. Keep identical to src/bengalbet/services/depositOffer.ts. */
function bbDepositOfferDefaults(): array {
    return ['enabled'=>true,'bonusPercent'=>47.0,'maxBonus'=>20000.0,'firstDepositOnly'=>true,'minDepositForBonus'=>500.0];
}
function bbValidateDepositOffer($c): array {
    if(!is_array($c)) throw new InvalidArgumentException('Invalid deposit offer');
    foreach(['enabled','firstDepositOnly'] as $k) if(!isset($c[$k]) || !is_bool($c[$k])) throw new InvalidArgumentException('Invalid '.$k);
    $out=['enabled'=>$c['enabled'],'firstDepositOnly'=>$c['firstDepositOnly']];
    foreach(['bonusPercent'=>100,'maxBonus'=>100000000,'minDepositForBonus'=>100000000] as $k=>$max){
        $v=$c[$k] ?? null;
        if(!is_numeric($v) || !is_finite((float)$v) || $v<0 || $v>$max) throw new InvalidArgumentException('Invalid '.$k);
        $out[$k]=round((float)$v,2);
    }
    return $out;
}
function bbDepositOffer(): array {
    $row=Database::fetchOne('SELECT config_json FROM deposit_offer_config WHERE id=1');
    if(!$row) return bbDepositOfferDefaults();
    try { return bbValidateDepositOffer(json_decode($row['config_json'],true)); }
    catch(InvalidArgumentException $e) { return ['enabled'=>false,'bonusPercent'=>0.0,'maxBonus'=>0.0,'firstDepositOnly'=>true,'minDepositForBonus'=>0.0]; }
}
function bbDepositBonus(array $offer,float $amount,bool $optIn,bool $hasPriorDeposit): float {
    if(empty($offer['enabled']) || !$optIn || !is_finite($amount) || $amount<=0) return 0.0;
    if($amount < (float)$offer['minDepositForBonus']) return 0.0;
    if(!empty($offer['firstDepositOnly']) && $hasPriorDeposit) return 0.0;
    $bonus=round($amount*(float)$offer['bonusPercent'])/100;
    if((float)$offer['maxBonus']>0) $bonus=min($bonus,(float)$offer['maxBonus']);
    return round($bonus,2);
}
