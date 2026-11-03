/** Maps a server member row (snake_case, numeric strings) onto the site's member fields. */
export function normalizeServerUser(raw: Record<string, any> | null | undefined): Record<string, any> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Record<string, any> = { ...raw };
  const pairs: [string, string][] = [
    ['free_spins', 'freeSpins'],
    ['golden_eggs_available', 'goldenEggsAvailable'],
    ['red_packets_available', 'redPacketsAvailable'],
    ['vip_level', 'vipLevel'],
    ['vip_exp', 'vipExp'],
    ['vip_max_exp', 'vipMaxExp'],
    ['unread_notifications', 'unreadNotifications'],
    ['referral_code', 'referralCode'],
    ['total_earnings', 'totalEarnings'],
    ['referred_friends_count', 'referredFriendsCount'],
    ['real_name', 'realName'],
    ['created_at', 'createdAt'],
  ];
  for (const [from, to] of pairs) {
    if (raw[from] !== undefined && raw[from] !== null) out[to] = raw[from];
    delete out[from];
  }
  for (const key of ['balance', 'freeSpins', 'goldenEggsAvailable', 'redPacketsAvailable', 'vipLevel', 'vipExp', 'vipMaxExp', 'unreadNotifications', 'totalEarnings', 'referredFriendsCount']) {
    if (out[key] !== undefined) {
      const n = Number(out[key]);
      if (Number.isFinite(n)) out[key] = n; else delete out[key];
    }
  }
  if (raw.has_lifetime_deposit !== undefined) { out.hasLifetimeDeposit = raw.has_lifetime_deposit === true || raw.has_lifetime_deposit === 1 || raw.has_lifetime_deposit === '1'; delete out.has_lifetime_deposit; }
  return out;
}
