export function mayProcessPayment(tx: { type: string; status: string } | null | undefined): boolean {
  return tx?.status === 'pending' && (tx.type === 'deposit' || tx.type === 'withdraw');
}