<?php
function bbMemberConfig(): array {
    $row=Database::fetchOne('SELECT config_json FROM new_member_config WHERE id=1');
    if($row) return bbValidateMemberConfig(json_decode($row['config_json'],true));
    $values=[[10,'login',0],[20,'bet',100],[30,'deposit',200],[50,'bet',300],[80,'bet',500],[100,'deposit',1000],[150,'bet',1500],[200,'bet',2000],[300,'deposit',3000],[500,'bet',5000],[800,'bet',8000],[1200,'bet',10000]];
    $days=[];foreach($values as $i=>$v)$days[]=['day'=>$i+1,'bonus'=>$v[0],'requirementType'=>$v[1],'requiredAmount'=>$v[2]];
    return ['enabled'=>true,'days'=>$days];
}
function bbValidateMemberConfig($config): array {
    if(!is_array($config) || !isset($config['enabled']) || !is_bool($config['enabled']) || !isset($config['days']) || !is_array($config['days']) || count($config['days'])!==12)throw new InvalidArgumentException('Exactly twelve tasks required');
    $out=['enabled'=>$config['enabled'],'days'=>[]];
    foreach(array_values($config['days']) as $i=>$task){
        if(!is_array($task) || ($task['day'] ?? null)!==$i+1 || !in_array($task['requirementType'] ?? '',['login','bet','deposit'],true))throw new InvalidArgumentException('Invalid task day or type');
        $item=['day'=>$i+1,'requirementType'=>$task['requirementType']];
        foreach(['bonus','requiredAmount'] as $key){$v=$task[$key] ?? null;if(!is_numeric($v) || !is_finite((float)$v) || $v<0 || $v>100000000)throw new InvalidArgumentException('Invalid '.$key);$item[$key]=round((float)$v,2);}
        if($item['requirementType']==='login' && $item['requiredAmount']!=0)throw new InvalidArgumentException('Login threshold must be zero');
        $out['days'][]=$item;
    }
    return $out;
}