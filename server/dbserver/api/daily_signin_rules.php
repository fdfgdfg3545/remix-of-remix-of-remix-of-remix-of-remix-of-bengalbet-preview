<?php
function bbSigninDefaults(): array {
    $days=[];
    for($day=1;$day<=30;$day++) $days[]=['day'=>$day,'bonus'=>round(2 + $day*1.5,2)];
    return ['enabled'=>true,'cycleDays'=>30,'dailyRequiredBet'=>0,'days'=>$days];
}
function bbSigninConfig(): array {
    $row=Database::fetchOne('SELECT config_json FROM daily_signin_config WHERE id=1');
    return $row ? json_decode($row['config_json'],true) : bbSigninDefaults();
}
function bbSigninNext(?array $last, string $today, array $config): array {
    $signed=$last && $last['date']===$today;
    $yesterday=(new DateTimeImmutable($today))->modify('-1 day')->format('Y-m-d');
    $streak=$signed ? (int)$last['streak'] : (($last && $last['date']===$yesterday) ? (int)$last['streak']+1 : 1);
    $day=(($streak-1) % $config['cycleDays'])+1;
    $bonus=0;
    foreach($config['days'] as $entry) if((int)$entry['day']===$day) $bonus=round((float)$entry['bonus'],2);
    return ['hasSignedToday'=>(bool)$signed,'streak'=>$streak,'day'=>$day,'bonus'=>$bonus];
}
function bbSigninValidatedConfig(array $input): array {
    if(!isset($input['enabled']) || !is_bool($input['enabled'])) throw new InvalidArgumentException('Enabled must be boolean');
    $cycle=filter_var($input['cycleDays'] ?? null,FILTER_VALIDATE_INT);
    if($cycle===false || $cycle<1 || $cycle>366) throw new InvalidArgumentException('Cycle must be 1 to 366 days');
    $bet=$input['dailyRequiredBet'] ?? 0;
    if(!is_numeric($bet) || !is_finite((float)$bet) || $bet<0 || $bet>100000000) throw new InvalidArgumentException('Invalid required bet');
    $days=$input['days'] ?? [];
    if(!is_array($days) || count($days)!==$cycle) throw new InvalidArgumentException('Every cycle day needs one bonus');
    $clean=[]; $seen=[];
    foreach($days as $entry) {
        $day=filter_var($entry['day'] ?? null,FILTER_VALIDATE_INT); $bonus=$entry['bonus'] ?? null;
        if($day===false || $day<1 || $day>$cycle || isset($seen[$day]) || !is_numeric($bonus) || !is_finite((float)$bonus) || $bonus<0 || $bonus>1000000) throw new InvalidArgumentException('Invalid day or bonus');
        $seen[$day]=true; $clean[]=['day'=>$day,'bonus'=>round((float)$bonus,2)];
    }
    usort($clean,fn($a,$b)=>$a['day']<=>$b['day']);
    return ['enabled'=>$input['enabled'],'cycleDays'=>$cycle,'dailyRequiredBet'=>(float)$bet,'days'=>$clean];
}
