<?php
if($section==='transactions' && in_array($action,['edit','update','delete','create'],true)) {
    if($action==='delete')Database::errorResponse('Ledger records must be retained; reject pending payments instead.',409);
    if($action==='create')Database::errorResponse('Direct ledger creation is disabled; use a pending payment request.',409);
    $allowed=['adminNote'=>'admin_note','admin_note'=>'admin_note','description'=>'description'];
    foreach(array_keys($input) as $key)if(!isset($allowed[$key]))Database::errorResponse('Financial ledger fields cannot be edited after creation.',409);
    $pdo=Database::getConnection();try {
        $pdo->beginTransaction();$tx=Database::fetchOne('SELECT id FROM transactions WHERE id=? FOR UPDATE',[$targetId]);if(!$tx)throw new RuntimeException('Transaction not found');
        $updates=[];foreach($input as $key=>$value)$updates[$allowed[$key]]=substr((string)$value,0,5000);
        if($updates)Database::update('transactions',$updates,'id=?',[$targetId]);$pdo->commit();Database::jsonResponse(['success'=>true,'message'=>'Ledger note saved']);
    }catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();Database::errorResponse('Ledger note could not be saved',400);}
}