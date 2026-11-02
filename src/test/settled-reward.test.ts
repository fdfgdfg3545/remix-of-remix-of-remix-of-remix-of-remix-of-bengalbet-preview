import { describe, expect, it, vi } from 'vitest';
import { refreshSettledReward } from '../bengalbet/services/settledReward';

describe('Completed reward settlements', () => {
  it('refreshes the authoritative wallet once after a confirmed claim', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    await refreshSettledReward({ success: true }, refresh);
    expect(refresh).toHaveBeenCalledTimes(1);
  });
  it('does not notify or refresh after a rejected claim', async () => {
    const refresh = vi.fn();
    await expect(refreshSettledReward({ success: false }, refresh)).rejects.toThrow();
    expect(refresh).not.toHaveBeenCalled();
  });
});