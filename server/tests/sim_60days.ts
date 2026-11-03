// Run: bun server/tests/sim_60days.ts --fixed   (config snapshot in sim_config/, refresh from the live admin API before re-running)
// 60-day, 300-new-members-per-day simulation of BengalBet promotion workflow.
// ENGINE = port of the live server PHP logic (reads live config snapshot).
// CHECKER = independent plan rules; every mismatch is reported as an issue.
import { PROMO_RULE_DEFAULTS, validatePromoRules, type PromoRules } from '../../src/bengalbet/services/promoRules';
import { depositBonus, type DepositOffer } from '../../src/bengalbet/services/depositOffer';
import { readFileSync, writeFileSync } from 'fs';

const FIX = process.argv.includes('--fixed'); // apply server fixes made in this round
const J = (f: string) => JSON.parse(readFileSync(new URL('./sim_config/' + f, import.meta.url).pathname, 'utf8'));
let rules: PromoRules = validatePromoRules(J('promo.json').rules ?? PROMO_RULE_DEFAULTS);
let offer: DepositOffer = J('dep.json').offer;
const rescueTiers = J('rescue.json').tiers.filter((t: any) => t.status === 'active').sort((a: any, b: any) => b.minLoss - a.minLoss);
const vipTiers = J('vip.json').tiers.filter((t: any) => t.status === 'active');
const mystery = J('mys.json').config;
const REF = { instant: 300, minDep: 500, minBet: 2000 };

let seed = 20261103; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const r2 = (n: number) => Math.round(n * 100) / 100;

type Bet = { day: string; t: number; cat: string; bet: number; win: number };
type U = { id: number; ref: number | null; joined: string; bal: number; vip: number; eggs: number; spins: number;
  deps: { amt: number; bonus: number; t: number }[]; bets: Bet[]; bonuses: { amt: number; t: number; kind: string }[];
  wds: { amt: number; t: number }[]; refPaid: boolean; active: number; q: number; lastRebate: number };
const users: U[] = []; const grants = new Map<string, number>(); // `${uid}|${key}` -> time
const grantCount = new Map<string, number>(); const vipClaims: { uid: number; type: string; level: number; date: string }[] = [];
const issues = new Map<string, { n: number; ex: string }>();
const stats: Record<string, number> = {}; const daily: string[] = [];
const bump = (k: string, v = 1) => (stats[k] = (stats[k] ?? 0) + v);
const issue = (k: string, ex: string) => { const i = issues.get(k); if (i) i.n++; else issues.set(k, { n: 1, ex }); };

// --- clock (Bangladesh time; the sim clock is "server time") ---
const START = Date.UTC(2026, 10, 3); let now = START;
const D = (t = now) => new Date(t).toISOString().slice(0, 10);
const H = (t = now) => new Date(t).getUTCHours(); const M = (t = now) => new Date(t).getUTCMinutes();
const dom = (t = now) => new Date(t).getUTCDate(); const isoDow = (t = now) => ((new Date(t).getUTCDay() + 6) % 7) + 1;
const yday = () => D(now - 864e5);
const grantOnce = (u: U, key: string) => { const k = u.id + '|' + key; if (grants.has(k)) return false; grants.set(k, now); grantCount.set(key, (grantCount.get(key) ?? 0) + 1); return true; };
const credit = (u: U, amt: number, kind: string) => { u.bal = r2(u.bal + amt); u.bonuses.push({ amt, t: now, kind }); bump('bonus:' + kind, amt); bump('count:' + kind); };

// ================= ENGINE (server port) =================
function register(ref: number | null): U {
  const u: U = { id: users.length + 1, ref, joined: D(), bal: 0, vip: FIX ? 0 : 1, eggs: 0, spins: 0, deps: [], bets: [], bonuses: [], wds: [], refPaid: false, active: 0.35 + rnd() * 0.5, q: 0, lastRebate: 0 };
  users.push(u); return u;
}
function vipSync(u: U) { // added by fix: level = highest active tier whose bet AND deposit targets are met; never lowers
  if (!FIX) return; const bet = u.bets.reduce((s, b) => s + b.bet, 0), dep = u.deps.reduce((s, d) => s + d.amt, 0);
  for (const t of vipTiers) if (bet >= t.targetBet && dep >= t.depositTarget && t.level > u.vip) u.vip = t.level;
}
function login(u: U) { if (rules.loginHammerPerDay > 0 && grantOnce(u, 'login_egg:' + D())) u.eggs += rules.loginHammerPerDay; }
function deposit(u: U, amt: number, optIn: boolean) {
  const bonus = depositBonus(offer, amt, optIn, u.deps.length > 0); // server computes the same formula at request time
  u.deps.push({ amt, bonus, t: now }); u.bal = r2(u.bal + amt + bonus); bump('deposits', amt); bump('depBonus', bonus);
  for (let i = 1; i <= rules.depositEggsPerDay; i++) if (grantOnce(u, `deposit_egg:${D()}:${i}`)) { u.eggs++; break; }
  if (amt >= rules.wheelTicketMinDeposit) for (let i = 1; i <= rules.wheelTicketsPerDay; i++) if (grantOnce(u, `deposit_spin:${D()}:${i}`)) { u.spins++; break; }
  refQualify(u); vipSync(u); return bonus;
}
function refQualify(f: U) {
  if (!f.ref || f.refPaid) return; const dep = f.deps.reduce((s, d) => s + d.amt, 0), bet = f.bets.reduce((s, b) => s + b.bet, 0);
  if (dep < REF.minDep || bet < REF.minBet) return; f.refPaid = true; users[f.ref - 1].q++; credit(users[f.ref - 1], REF.instant, 'referral');
}
function play(u: U, cat: string, bet: number) {
  if (u.bal < bet) return false; const rtp = 0.965, hit = 0.35; const win = rnd() < hit ? r2(bet * (rtp / hit) * (0.3 + rnd() * 1.4)) : 0;
  u.bal = r2(u.bal - bet + win); u.bets.push({ day: D(), t: now, cat, bet, win }); bump('bets', bet); bump('wins', win); refQualify(u); vipSync(u); return true;
}
const sumBets = (u: U, f: (b: Bet) => boolean, k: 'bet' | 'win' = 'bet') => u.bets.reduce((s, b) => (f(b) ? s + b[k] : s), 0);
function claimRescue(u: U): number | string {
  const rr = rules.rescue; if (!rr.enabled) return 'off'; if (H() >= rr.claimDeadlineHour) return 'late';
  if (!grantOnce(u, 'rescue:' + yday())) return 'dup';
  const f = (b: Bet) => b.day === yday() && rr.categories.includes(b.cat); const loss = Math.max(0, sumBets(u, f) - sumBets(u, f, 'win'));
  const t = rescueTiers.find((x: any) => loss >= x.minLoss); if (loss <= 0 || !t) { grants.delete(u.id + '|rescue:' + yday()); return 'noloss'; }
  const b = Math.min(t.maxBonus, r2(loss * t.percentage / 100)); credit(u, b, 'rescue'); return b;
}
function offerClaim(u: U, offer_: 'slot_daily' | 'rebate' | 'member_day'): number | string {
  if (offer_ === 'slot_daily') { const c = rules.slotDaily; if (!c.enabled || H() < c.claimFromHour) return 'closed';
    const t = sumBets(u, (b) => b.day === yday() && b.cat === 'slot'); const b = tb(t, c.minBet, c.ratePercent, c.maxBonus);
    if (b <= 0) return 'none'; if (!grantOnce(u, 'slot_daily:' + yday())) return 'dup'; credit(u, b, 'slot_daily'); return b; }
  if (offer_ === 'rebate') { const c = rules.rebate; if (!c.enabled) return 'closed';
    const last = u.lastRebate;
    const t = sumBets(u, (b) => b.t > last); const b = tb(t, 0, c.ratePercent, 0); if (b < 0.01) return 'none';
    u.lastRebate = now; credit(u, b, 'rebate'); return b; }
  const c = rules.memberDay; if (!c.enabled || dom() !== c.day) return 'closed'; const m = D().slice(0, 7);
  const t = sumBets(u, (b) => b.day >= m + '-01' && b.day <= `${m}-${String(c.day - 1).padStart(2, '0')}`); const b = tb(t, c.minBet, c.ratePercent, c.maxBonus);
  if (b <= 0) return 'none'; if (!grantOnce(u, 'member_day:' + m)) return 'dup'; credit(u, b, 'member_day'); return b;
}
const tb = (t: number, min: number, rate: number, max: number) => (t <= 0 || t < min ? 0 : r2(max > 0 ? Math.min(Math.round(t * rate) / 100, max) : Math.round(t * rate) / 100));
function claimMissions(u: U) {
  const c = rules.missions; if (!c.enabled) return; const t = sumBets(u, (b) => b.day === D() && (c.category === 'all' || b.cat === c.category));
  c.tiers.forEach((x, i) => { if (t >= x.bet && grantOnce(u, `mission:${D()}:${i + 1}`)) credit(u, x.bonus, 'mission'); });
}
function claimRefLevels(u: U) {
  const c = rules.referralLevels; if (!c.enabled) return; const q = u.q;
  c.tiers.forEach((x, i) => { if (q >= x.friends && grantOnce(u, 'ref_level:' + (i + 1))) credit(u, x.bonus, 'ref_level'); });
}
function claimVip(u: U, type: 'upgrade' | 'weekly' | 'monthly', level: number): number | string {
  vipSync(u); if (level < 1 || level > u.vip) return 'level'; if (type !== 'upgrade' && level !== u.vip) return 'level';
  const t = vipTiers.find((x: any) => x.level === level); if (!t) return 'tier';
  if (type === 'weekly' && isoDow() !== rules.vip.weeklyClaimDay) return 'day';
  if (type === 'monthly' && dom() !== rules.vip.monthlyClaimDay) return 'day';
  const monday = D(now - (isoDow() - 1) * 864e5), month1 = D().slice(0, 8) + '01';
  if (vipClaims.some((c) => c.uid === u.id && c.type === type && (type === 'upgrade' ? c.level === level : c.date >= (type === 'weekly' ? monday : month1)))) return 'dup';
  const b = t[type + 'Bonus']; vipClaims.push({ uid: u.id, type, level, date: D() }); credit(u, b, 'vip_' + type); return b; // server credits even ৳0 rows? bbRewardCredit rejects <=0
}
function claimPacket(u: U): number | string {
  const p = rules.redPacket; if (!p.enabled || !p.hours.includes(H()) || M() >= p.durationMinutes) return 'closed';
  const round = D() + '-' + H(); if ((grantCount.get('packet:' + round) ?? 0) >= p.perRoundLimit) return 'full';
  if (!grantOnce(u, 'packet:' + round)) return 'dup'; const b = pick([1, 2, 3, 5, 8, 18]); credit(u, b, 'red_packet'); return b;
}
function claimMystery(u: U): number | string {
  if (!mystery.enabled || dom() !== mystery.triggerDayOfMonth || H() < mystery.triggerHour) return 'closed'; const m = D().slice(0, 7);
  if (sumBets(u, (b) => b.day >= m + '-01' && b.day <= `${m}-${String(mystery.triggerDayOfMonth - 1).padStart(2, '0')}`) < mystery.minBetRequired) return 'bet';
  if (!grantOnce(u, 'mystery:' + m)) return 'dup'; const b = mystery.minBonusAmount + rnd() * (mystery.maxBonusAmount - mystery.minBonusAmount); credit(u, r2(b), 'mystery'); return r2(b);
}
function useChance(u: U) { while (u.eggs > 0) { u.eggs--; credit(u, pick([1, 2, 5, 8, 18, 28]), 'golden_egg'); } while (u.spins > 0) { u.spins--; credit(u, pick([2, 5, 10, 20, 52]), 'wheel'); } }
function remaining(u: U) {
  const w = rules.withdrawal; if (!w.enabled) return 0; const since = u.wds.length ? u.wds[u.wds.length - 1].t : -1;
  const dep = u.deps.filter((d) => d.t > since), oth = u.bonuses.filter((b) => b.t > since).reduce((s, b) => s + b.amt, 0);
  const firstBonus = u.deps[0] && u.deps[0].t > since ? u.deps[0].bonus : 0;
  const req = (dep.reduce((s, d) => s + d.amt + d.bonus, 0) + oth) * w.depositTurnover + firstBonus * w.depositBonusTurnover;
  return Math.max(0, r2(req - sumBets(u, (b) => b.t > since)));
}
function withdraw(u: U, amt: number): string { if (amt < 500 || amt > 25000) return 'limit'; if (u.bal < amt) return 'balance'; if (remaining(u) > 0) return 'turnover'; u.bal = r2(u.bal - amt); u.wds.push({ amt, t: now }); bump('withdraws', amt); return 'ok'; }

// ================= CHECKER (plan) =================
const PLAN = () => ({ depPct: offer.bonusPercent, depMin: offer.minDepositForBonus, depCap: offer.maxBonus });
function checkDeposit(u: U, amt: number, optIn: boolean, got: number) {
  const p = PLAN(); const first = u.deps.length === 1;
  const exp = optIn && first && amt >= p.depMin ? Math.min(r2(amt * p.depPct / 100), p.depCap) : 0;
  if (Math.abs(exp - got) > 0.01) issue('deposit-bonus-mismatch', `member ${u.id} deposit ${amt} got ${got} expected ${exp}`);
}
function expectReject(name: string, res: number | string, why: string) { if (typeof res === 'number') issue(`${name}-granted-outside-rule`, why); else bump(`reject:${name}:${res}`); }
function checkVipEntitlement(u: U) {
  const bet = sumBets(u, () => true), dep = u.deps.reduce((s, d) => s + d.amt, 0);
  const earned = Math.max(0, ...vipTiers.filter((t: any) => bet >= t.targetBet && dep >= t.depositTarget).map((t: any) => t.level));
  if (u.vip > earned) issue('vip-level-above-plan', `member ${u.id} is VIP${u.vip} with bets ৳${r2(bet)} deposits ৳${dep} (earned VIP${earned})`);
  if (u.vip < earned) issue('vip-level-not-upgraded', `member ${u.id} earned VIP${earned} but stays VIP${u.vip}`);
}

// ================= ADMIN CHANGES during the run =================
const adminPlan: Record<number, [string, () => void]> = {
  15: ['জমা বোনাস ৪৭% → ৩৩%', () => (offer = { ...offer, bonusPercent: 33 })],
  25: ['উদ্ধার শেষ সময় ১০টা → ১১টা, লাল খামে ১৮টা যোগ', () => (rules = validatePromoRules({ ...rules, rescue: { ...rules.rescue, claimDeadlineHour: 11 }, redPacket: { ...rules.redPacket, hours: [...rules.redPacket.hours, 18] } }))],
  35: ['সদস্য দিবস বন্ধ', () => (rules = validatePromoRules({ ...rules, memberDay: { ...rules.memberDay, enabled: false } }))],
  40: ['মিশন ধাপ ১: ৳১,০০০→৳৩ বদলে ৳১,০০০→৳৫', () => (rules = validatePromoRules({ ...rules, missions: { ...rules.missions, tiers: rules.missions.tiers.map((t, i) => (i ? t : { bet: 1000, bonus: 5 })) } }))],
  45: ['সদস্য দিবস চালু, তারিখ ২০', () => (rules = validatePromoRules({ ...rules, memberDay: { ...rules.memberDay, enabled: true, day: 20 } }))],
  50: ['উইথড্র শর্ত: জমা বোনাস ×৮ → ×৫', () => (rules = validatePromoRules({ ...rules, withdrawal: { ...rules.withdrawal, depositBonusTurnover: 5 } }))],
};
const at = (day: number, h: number, m = 0) => START + day * 864e5 + h * 36e5 + m * 6e4;

// ================= RUN =================
for (let day = 0; day < 60; day++) {
  if (adminPlan[day]) { adminPlan[day][1](); daily.push(`  >> অ্যাডমিন বদল: ${adminPlan[day][0]}`); }
  const before = { ...stats }; let newU = 0, refU = 0;
  for (let i = 0; i < 300; i++) { const ref = users.length && rnd() < 0.5 ? pick(users).id : null; register(ref); newU++; if (ref) refU++; }
  const todays = users.filter((u) => u.joined === D(at(day, 0)) || rnd() < u.active * 0.6);
  for (const u of todays) {
    // early morning: rescue (some on time, some late to check the deadline), red packet at 00:xx
    now = at(day, Math.floor(rnd() * 13), Math.floor(rnd() * 60));
    if (u.bets.some((b) => b.day === yday())) {
      const r = claimRescue(u); const dl = rules.rescue.claimDeadlineHour;
      if (H() >= dl) expectReject('rescue', r, `member ${u.id} claimed rescue at ${H()}:00 (deadline ${dl}:00)`);
      else if (typeof r === 'number') { const r2_ = claimRescue(u); expectReject('rescue', r2_, `member ${u.id} claimed rescue twice for ${yday()}`); }
    }
    const s = offerClaim(u, 'slot_daily'); if (H() < rules.slotDaily.claimFromHour) expectReject('slot_daily', s, `slot bonus at ${H()}:00 before ${rules.slotDaily.claimFromHour}:00`);
    login(u); login(u);
    // deposit
    if ((u.deps.length === 0 && rnd() < 0.7) || rnd() < 0.25) {
      now = at(day, 10 + Math.floor(rnd() * 3), Math.floor(rnd() * 60));
      const amt = pick([200, 300, 500, 800, 1000, 2000, 5000, 10000, 50000]); const opt = rnd() < 0.85;
      const got = deposit(u, amt, opt); checkDeposit(u, amt, opt, got);
    }
    // play through the afternoon
    now = at(day, 13 + Math.floor(rnd() * 3), Math.floor(rnd() * 60));
    const rounds = 5 + Math.floor(rnd() * 40); const stake = pick([10, 20, 50, 100, 200]);
    for (let k = 0; k < rounds; k++) if (!play(u, pick(['slot', 'slot', 'slot', 'fishing', 'live', 'crash']), stake)) break;
    claimMissions(u); claimMissions(u); useChance(u); claimRefLevels(u); claimRefLevels(u);
    if (rnd() < 0.3) offerClaim(u, 'rebate');
    // red packet: random minute in a random hour
    now = at(day, pick([0, 12, 16, 18, 20, 21]), Math.floor(rnd() * 60)); const pk = claimPacket(u);
    if (!rules.redPacket.hours.includes(H()) || M() >= rules.redPacket.durationMinutes) expectReject('red_packet', pk, `packet at ${H()}:${M()}`);
    // member day / mystery / vip at 19:00
    now = at(day, 19, 5);
    const md = offerClaim(u, 'member_day'); if (!rules.memberDay.enabled || dom() !== rules.memberDay.day) expectReject('member_day', md, `member day on ${D()}`);
    const my = claimMystery(u); if (dom() !== mystery.triggerDayOfMonth) expectReject('mystery', my, `mystery on ${D()}`);
    if (u.vip >= 1) { for (let l = 1; l <= u.vip; l++) claimVip(u, 'upgrade', l);
      const w = claimVip(u, 'weekly', u.vip); if (isoDow() !== rules.vip.weeklyClaimDay) expectReject('vip_weekly', w, `weekly VIP on ${D()}`);
      const mo = claimVip(u, 'monthly', u.vip); if (dom() !== rules.vip.monthlyClaimDay) expectReject('vip_monthly', mo, `monthly VIP on ${D()}`); }
    // withdraw attempt at 21:00
    now = at(day, 21, 30); if (u.bal >= 500 && rnd() < 0.35) { const rem = remaining(u); const res = withdraw(u, Math.min(25000, Math.floor(u.bal)));
      if (res === 'ok' && rem > 0) issue('withdraw-before-turnover', `member ${u.id}`); bump('wd:' + res); }
    if (u.bal < -0.001) issue('negative-balance', `member ${u.id} ${u.bal}`);
  }
  for (const u of users.slice(-300).concat(todays.slice(0, 200))) checkVipEntitlement(u);
  const d = (k: string) => Math.round((stats[k] ?? 0) - (before[k] ?? 0));
  daily.push(`দিন ${String(day + 1).padStart(2)} ${D(at(day, 0))} | নতুন ${newU} (রেফার ${refU}) | সক্রিয় ${todays.length} | জমা ৳${d('deposits')} বোনাস ৳${d('depBonus')} | বাজি ৳${d('bets')} | উদ্ধার ${d('count:rescue')} | স্লট ${d('count:slot_daily')} | মিশন ${d('count:mission')} | লাল খাম ${d('count:red_packet')} | রেফার ${d('count:referral')} | ভিআইপি ${d('count:vip_weekly') + d('count:vip_monthly') + d('count:vip_upgrade')} | সদস্য দিবস ${d('count:member_day')} | রহস্য ${d('count:mystery')} | উইথড্র ${d('wd:ok')}/${d('wd:turnover')} আটকানো`);
}
// ledger invariant
for (const u of users) { const exp = r2(u.deps.reduce((s, d) => s + d.amt + d.bonus, 0) + u.bonuses.reduce((s, b) => s + b.amt, 0) + sumBets(u, () => true, 'win') - sumBets(u, () => true) - u.wds.reduce((s, w) => s + w.amt, 0));
  if (Math.abs(exp - u.bal) > 0.05) issue('ledger-mismatch', `member ${u.id} bal ${u.bal} ledger ${exp}`); }
for (const [k, n] of grantCount) if (k.startsWith('packet:') && n > rules.redPacket.perRoundLimit) issue('packet-over-limit', k);

const out = { mode: FIX ? 'fixed' : 'current', members: users.length, issues: Object.fromEntries(issues), stats: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, r2(v)])) };
writeFileSync(`/tmp/sim-result-${out.mode}.json`, JSON.stringify(out, null, 1)); writeFileSync(`/tmp/sim-daily-${out.mode}.txt`, daily.join('\n'));
console.log(JSON.stringify({ mode: out.mode, members: out.members, issues: out.issues }, null, 1));
