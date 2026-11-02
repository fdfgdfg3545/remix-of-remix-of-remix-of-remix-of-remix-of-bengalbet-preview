import { expect, it } from 'vitest';
import { mayProcessPayment } from '../bengalbet/services/paymentActions';
it('only permits pending deposit and withdrawal decisions', () => {
  expect(mayProcessPayment({ type: 'deposit', status: 'pending' })).toBe(true);
  expect(mayProcessPayment({ type: 'withdraw', status: 'pending' })).toBe(true);
  for (const status of ['success', 'rejected', 'processing', 'flagged']) expect(mayProcessPayment({ type: 'withdraw', status })).toBe(false);
  expect(mayProcessPayment({ type: 'bonus', status: 'pending' })).toBe(false);
});