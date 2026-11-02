import { describe, expect, it } from 'vitest';
import { mayAttachAdminCredential, mayAttachMemberCredential } from '../bengalbet/services/requestPolicy';

describe('Credential request boundaries', () => {
  it('never attaches the admin credential to member wallet or rewards requests', () => {
    for (const endpoint of ['/api/wallet/balance', '/api/rewards/claim', '/api/games/bet', '/api/auth/login', '/api/vip/history']) {
      expect(mayAttachAdminCredential(endpoint, 'POST')).toBe(false);
    }
  });
  it('allows legacy admin requests only on admin routes or tier mutations', () => {
    expect(mayAttachAdminCredential('/api/admin/daily-signin/config', 'POST')).toBe(true);
    expect(mayAttachAdminCredential('/api/vip/tiers', 'POST')).toBe(true);
    expect(mayAttachAdminCredential('/api/vip/tiers', 'GET')).toBe(false);
    expect(mayAttachAdminCredential('/api/admin/vip/tiers', 'GET')).toBe(true);
    expect(mayAttachAdminCredential('/api/admin/vip/tiers', 'POST')).toBe(true);
    expect(mayAttachAdminCredential('/api/admin/vip/tiers/1', 'DELETE')).toBe(true);
  });
  it('does not forward either credential to an absolute URL', () => {
    expect(mayAttachAdminCredential('https://example.com/api/admin/stats')).toBe(false);
    expect(mayAttachMemberCredential('https://example.com/api/wallet/balance')).toBe(false);
    expect(mayAttachMemberCredential('/api/wallet/balance')).toBe(true);
  });
});