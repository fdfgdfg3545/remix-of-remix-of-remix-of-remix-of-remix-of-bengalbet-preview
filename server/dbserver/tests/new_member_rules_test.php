<?php
class Database { public static function fetchOne($sql){return null;} }
require __DIR__.'/../api/new_member_rules.php';
$config=bbMemberConfig();
if(count($config['days'])!==12 || $config['days'][0]['bonus']!==10 || $config['days'][11]['bonus']!==1200)throw new RuntimeException('Existing twelve-day rewards changed');
if($config['days'][1]['requiredAmount']!==100 || $config['days'][2]['requiredAmount']!==200)throw new RuntimeException('Existing bet/deposit thresholds changed');
bbValidateMemberConfig($config);
$config['days'][0]['requiredAmount']=100;$rejected=false;try{bbValidateMemberConfig($config);}catch(InvalidArgumentException $e){$rejected=true;}if(!$rejected)throw new RuntimeException('Invalid login threshold allowed');
echo "Member configuration assertions passed\n";