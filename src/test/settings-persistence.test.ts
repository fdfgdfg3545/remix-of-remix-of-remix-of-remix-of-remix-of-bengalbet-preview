import { describe, expect, it, vi } from 'vitest';
import { saveVerifiedSettings } from '../bengalbet/services/settingsPersistence';

const siteNotice = { enabled: true, titleBn: 'ঘোষণা', titleEn: 'Notice', contentBn: 'বিবরণ', contentEn: 'Details', bannerImage: '' };

describe('Admin settings server confirmation', () => {
  it('verifies deposit transaction limits as well as the notice', async () => {
    const settings = { siteNotice, minDeposit: 500, maxDeposit: 100000 };
    const api = { updateSettings: vi.fn().mockResolvedValue({ success: true }), getSettings: vi.fn().mockResolvedValue({ success: true, settings: { ...settings, minDeposit: 200 } }) };
    await expect(saveVerifiedSettings(settings, api)).rejects.toThrow();
    api.getSettings.mockResolvedValue({ success: true, settings });
    await expect(saveVerifiedSettings(settings, api)).resolves.toEqual(settings);
  });
  it('does not confirm maintenance mode when the saved value differs', async () => {
    const api = { updateSettings: vi.fn().mockResolvedValue({ success: true }), getSettings: vi.fn().mockResolvedValue({ success: true, settings: { maintenanceMode: false } }) };
    await expect(saveVerifiedSettings({ maintenanceMode: true }, api)).rejects.toThrow();
  });
  it('reports success only when saved notice reads back unchanged', async () => {
    const settings = { siteNotice };
    const api = { updateSettings: vi.fn().mockResolvedValue({ success: true }), getSettings: vi.fn().mockResolvedValue({ success: true, settings }) };
    expect(await saveVerifiedSettings(settings, api)).toEqual(settings);
    expect(api.updateSettings).toHaveBeenCalledWith(settings);
  });
  it('rejects a failed save without pretending success or reading stale data', async () => {
    const api = { updateSettings: vi.fn().mockResolvedValue({ success: false }), getSettings: vi.fn() };
    await expect(saveVerifiedSettings({ siteNotice }, api)).rejects.toThrow();
    expect(api.getSettings).not.toHaveBeenCalled();
  });
  it('rejects failed or different server readback', async () => {
    const api = { updateSettings: vi.fn().mockResolvedValue({ success: true }), getSettings: vi.fn().mockResolvedValue({ success: true, settings: { siteNotice: { ...siteNotice, enabled: false } } }) };
    await expect(saveVerifiedSettings({ siteNotice }, api)).rejects.toThrow();
    api.getSettings.mockResolvedValue({ success: false });
    await expect(saveVerifiedSettings({ siteNotice }, api)).rejects.toThrow();
  });
});