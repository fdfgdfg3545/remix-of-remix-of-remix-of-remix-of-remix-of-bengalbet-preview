<?php
/** Atomic pending-to-final transitions; caller must already be an authenticated administrator. */
function bbSettlePendingMoney(string $id,string $status,array $input): void {
    if(!in_array($status,['success','rejected'],true))throw new RuntimeException('Only approve or reject a pending payment');
    $tx=Database::fetchOne('SELECT * FROM transactions WHERE id=? FOR UPDATE',[$id]);
    if(!$tx)throw new RuntimeException('Transaction not found');
    if(!in_array($tx['type'],['deposit','withdraw'],true))throw new RuntimeException('Only payment transactions can be processed');
    if($tx['status']===$status)return;
    if($tx['status']!=='pending')throw new RuntimeException('Finalized transactions cannot change status');
    $amount=(float)$tx['amount'];if(!is_finite($amount)||$amount<=0)throw new RuntimeException('Invalid stored amount');
    $user=Database::fetchOne('SELECT id FROM users WHERE id=? FOR UPDATE',[$tx['user_id']]);if(!$user)throw new RuntimeException('User not found');
    if($status==='success' && $tx['type']==='deposit')bbApproveDeposit($tx);
    if($status==='rejected' && $tx['type']==='withdraw')Database::execute('UPDATE users SET balance=balance+? WHERE id=?',[$amount,$tx['user_id']]);
    Database::update('transactions',['status'=>$status,'admin_note'=>substr($input['adminNote']??$tx['admin_note']??'',0,5000),'rejection_reason'=>substr($input['rejectionReason']??'',0,5000),'processed_at'=>date('Y-m-d H:i:s'),'processed_by'=>'Admin'],'id=?',[$id]);
}
if($section==='transactions' && in_array($action,['status','batch'],true)) {
    if($method!=='POST')Database::errorResponse('Method Not Allowed',405);
    $ids=$action==='status'?[$targetId]:($input['ids']??[]);
    if(!is_array($ids)||!count($ids)||count($ids)>200)Database::errorResponse('Invalid payment selection',422);
    $ids=array_values(array_unique($ids));sort($ids,SORT_STRING);
    $pdo=Database::getConnection();try {
        $pdo->beginTransaction();foreach($ids as $id){if(!is_string($id)||$id==='')throw new RuntimeException('Invalid transaction');bbSettlePendingMoney($id,$input['status']??'', $input);}
        $pdo->commit();Database::jsonResponse(['success'=>true,'updatedCount'=>count($ids),'message'=>'Payment status confirmed']);
    }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException)?$e->getMessage():'Payment could not be processed',400);}
}