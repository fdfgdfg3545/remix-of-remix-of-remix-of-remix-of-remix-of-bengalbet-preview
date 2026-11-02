import { describe, expect, it, vi } from 'vitest';
import { saveVerifiedSettings } from '../bengalbet/services/settingsPersistence';

const siteNotice = { enabled: true, titleBn: 'ঘোষণা', titleEn: 'Notice', contentBn: 'বিবরণ', contentEn: 'Details', bannerImage: '' };

describe('Admin settings server confirmation', () => {
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