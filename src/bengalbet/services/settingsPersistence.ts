export interface SiteNotice {
  enabled: boolean;
  titleBn: string;
  titleEn: string;
  contentBn: string;
  contentEn: string;
  bannerImage: string;
}

export async function saveVerifiedSettings(
  settings: Record<string, unknown>,
  api: {
    updateSettings: (settings: unknown) => Promise<{ success: boolean; message?: string }>;
    getSettings: () => Promise<{ success: boolean; settings?: Record<string, unknown> }>;
  },
) {
  const saved = await api.updateSettings(settings);
  if (!saved.success) throw new Error(saved.message || 'সেটিংস সংরক্ষণ করা যায়নি।');
  const readback = await api.getSettings();
  if (!readback.success || !readback.settings) {
    throw new Error('সংরক্ষণের পর সার্ভারের তথ্য যাচাই করা যায়নি।');
  }
  const matches = (expected: unknown, actual: unknown): boolean => {
    if (Array.isArray(expected)) {
      return Array.isArray(actual) && expected.length === actual.length && expected.every((value, i) => matches(value, actual[i]));
    }
    if (expected !== null && typeof expected === 'object') {
      if (actual === null || typeof actual !== 'object') return false;
      return Object.entries(expected).every(([key, value]) => matches(value, (actual as Record<string, unknown>)[key]));
    }
    return expected === actual;
  };
  for (const [key, value] of Object.entries(settings)) {
    if (!matches(value, readback.settings[key])) {
      throw new Error('সার্ভারের সেটিংসের সঙ্গে সংরক্ষিত তথ্য মিলছে না। আবার লোড করুন।');
    }
  }
  return readback.settings;
}