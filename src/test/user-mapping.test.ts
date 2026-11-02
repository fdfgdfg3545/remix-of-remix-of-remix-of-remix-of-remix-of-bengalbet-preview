import { describe, expect, it } from 'vitest';
import { normalizeServerUser } from '../bengalbet/services/userMapping';

describe('server member mapping', () => {
  it('uses the server hammer, wheel and packet counts instead of site defaults', () => {
    const u = normalizeServerUser({ balance: '4246.00', golden_eggs_available: 4, free_spins: '6', red_packets_available: 3 });
    expect(u['balance']).toBe(4246);
    expect(u['goldenEggsAvailable']).toBe(4);
    expect(u['freeSpins']).toBe(6);
    expect(u['redPacketsAvailable']).toBe(3);
  });
  it('drops values that are not numbers rather than showing them', () => {
    expect(normalizeServerUser({ balance: 'abc' })['balance']).toBeUndefined();
  });
});
