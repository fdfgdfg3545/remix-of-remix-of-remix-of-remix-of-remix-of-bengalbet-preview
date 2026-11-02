export interface SiteNotice {
  enabled: boolean;
  titleBn: string;
  titleEn: string;
  contentBn: string;
  contentEn: string;
  bannerImage: string;
}

export async function saveVerifiedSettings(
  settings: Record<string, unknown> & { siteNotice: SiteNotice },
  api: {
    updateSettings: (settings: unknown) => Promise<{ success: boolean; message?: string }>;
    getSettings: () => Promise<{ success: boolean; settings?: { siteNotice?: SiteNotice } }>;
  },
) {
  const saved = await api.updateSettings(settings);
  if (!saved.success) throw new Error(saved.message || 'সেটিংস সংরক্ষণ করা যায়নি।');
  const readback = await api.getSettings();
  if (!readback.success || !readback.settings?.siteNotice) {
    throw new Error('সংরক্ষণের পর সার্ভারের তথ্য যাচাই করা যায়নি।');
  }
  for (const key of Object.keys(settings.siteNotice) as (keyof SiteNotice)[]) {
    if (readback.settings.siteNotice[key] !== settings.siteNotice[key]) {
      throw new Error('সার্ভারের নোটিশের সঙ্গে সংরক্ষিত তথ্য মিলছে না। আবার লোড করুন।');
    }
  }
  return readback.settings;
}