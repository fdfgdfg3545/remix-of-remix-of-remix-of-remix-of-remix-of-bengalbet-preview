<?php
if($action!=='withdraw')return;
if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
$raw=$input['amount']??null;
if(!is_numeric($raw)||!is_finite((float)$raw)||(float)$raw<=0)Database::errorResponse('Invalid amount',422);
$amount=round((float)$raw,2);$type=strtolower(trim($input['walletType']??''));$account=trim($input['accountNumber']??'');
if(!in_array($type,['bkash','nagad','rocket','usdt'],true)||$account===''||strlen($account)>128)Database::errorResponse('Valid destination required',422);
$settings=Database::fetchOne('SELECT min_withdraw,max_withdraw,maintenance_mode FROM site_settings WHERE id=1');
if(!$settings)Database::errorResponse('Payment configuration unavailable',503);
if($settings['maintenance_mode'])Database::errorResponse('Payments are paused',503);
if($amount<(float)$settings['min_withdraw']||$amount>(float)$settings['max_withdraw'])Database::errorResponse('Amount outside configured withdrawal limits',422);
$pdo=Database::getConnection();try {
    $pdo->beginTransaction();$user=Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE',[$userId]);
    if(!$user||$user['status']!=='active')throw new RuntimeException('Active account required');
    if((float)$user['balance']<$amount)throw new RuntimeException('Insufficient balance');
    if(Database::fetchOne("SELECT id FROM transactions WHERE user_id=? AND type='withdraw' AND status='pending'",[$userId]))throw new RuntimeException('A withdrawal is already pending');
    $id='tx-'.bin2hex(random_bytes(12));$row=['id'=>$id,'user_id'=>$userId,'username'=>$user['username'],'user_phone'=>$user['phone'],'type'=>'withdraw','amount'=>$amount,'bonus'=>0,'fee'=>0,'channel'=>$type,'account_number'=>$account,'trx_id'=>'WD-'.bin2hex(random_bytes(12)),'status'=>'pending','description'=>'Wallet withdrawal pending approval','created_at'=>date('Y-m-d H:i:s')];
    Database::insert('transactions',$row);Database::execute('UPDATE users SET balance=balance-? WHERE id=?',[$amount,$userId]);
    $balance=Database::fetchOne('SELECT balance FROM users WHERE id=?',[$userId]);$pdo->commit();
    Database::jsonResponse(['success'=>true,'message'=>'উত্তোলন অনুরোধ জমা হয়েছে।','newBalance'=>(float)$balance['balance'],'transaction'=>$row]);
}catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'Withdrawal could not be saved',400);}