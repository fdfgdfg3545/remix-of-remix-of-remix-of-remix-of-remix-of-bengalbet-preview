# Remaining work

## 2026-11-03 continuation: popup/admin retest
- [x] Reran 10 member sections after referral/policy fixes; no page errors.
- [x] Opened all 13 admin sections; isolated zero-bonus message created, received through member inbox, deleted and readback verified.
- [x] Fixed message row mapping/readback, draft-reset feedback and misleading message templates; 67 tests passed, build OK.
- [x] Recorded results in TASKLIST.txt and CONTEXT.txt. Full mutation/permissions audit and special-game conversion remain outside this completed check.

## 2026-11-02 10:25 request: missions, referral leaderboard/levels, promo page + admin editor, plan doc, retest
- [x] Daily missions on server (26 tiers, admin-editable, claim once per tier/day); both mission pages use it. Live-tested.
- [x] Referral medal levels real (qualified friends, admin-editable, claim once) and leaderboard/recent payouts from server. Live-tested.
- [x] Promotion page reads server list; admin promotion editor (add/edit/reorder/on-off/delete/reset); popup shows live rules; claim button goes to real offer page. Live + browser tested.
- [x] Withdrawal wagering fields added to admin rules page.
- [x] Plan document v3 saved to Files. 59 tests pass.

## 2026-11-02 09:11 request: games to server, then remaining offers (in order)
- [x] Server-decided rounds in the standard game screen (bet, win, bet record, VIP EXP, referral 1% + ৳300 qualify); tested by API, parallel bets and browser.
- [x] Daily slot bonus, real-time rebate (max 3%), member day — admin-editable in promotion rules, member claim buttons on the rebate page; server-tested.
- [ ] The 20 special games (Super Ace, Aviator, etc.) still decide results on the screen and play with demo money only.
- [x] Withdrawal wagering rule tested live (blocked at ৳500 left, allowed after ৳500 bets); both withdrawal pages show real remaining wagering, fake 1-click test button removed.

## 2026-11-02 09:10 request: connect test server after remix
- [x] Old neextserver connection removed; master key saved as a secure project secret; server ping OK (30 tables, Bangladesh time).
- [ ] User should replace the weak master key on the server, then update the saved secret.

## 2026-11-02 08:43 request: implement everything + admin can edit/delete/manage all settings
- [x] One admin "promotion rules" page (server config, readback, reset): login hammers, deposit eggs/day, wheel ticket threshold/day, red packet rounds/duration/limit, rescue deadline/game types, VIP weekly day/monthly date, app bonus.
- [x] Deposit offer reset button; plan defaults (47% first deposit) are the reset value.
- [x] App ৳52 bonus server-settled once; VIP weekly/monthly days enforced; referral settings validated and turnover key unified.
- [x] Server e2e: rule edits take effect (extra red packet round claimable), readback, reset, app bonus once. 45 tests pass.
- [ ] Admin pages not opened in a browser (needs separate admin login).
- [ ] Games still client-decided (bets disabled) — blocks turnover-based offers; daily slot cashback, member day, 3% rebate, turnover locks not built.

## 2026-11-02 08:26 request: implement promo/notice plan everywhere (server data is test data)
- [x] Deposit: first deposit 47%, min 500, max bonus 20,000; promo + notice text aligned.
- [x] Loss rescue: yesterday's slot/fishing loss ≥1,000, 3/5/8%, cap 88,888, claim until 10:00.
- [x] Golden egg (20–18,222), red packet (10–77,777, 4 daily rounds, first 50), wheel (5–1,50,000 iPhone) prizes decided by server; egg/packet screens no longer pick prizes in the browser.
- [x] Grants: daily login hammer, +1 egg per approved deposit (3/day), wheel ticket for approved ≥1,000 deposit (1/day).
- [x] Referral: 300 once when friend has approved ≥500 deposit and ≥2,000 turnover; 0.7% deposit commission from settings.
- [x] Server timezone set to Bangladesh time; member fallback-to-other-account bugs removed in sign-in "me" and referral.
- [x] Member reward counts now read from the server. 40 tests pass; e2e on new test members passed.
- [ ] Games: server-decided rounds needed (bets disabled) — blocks referral turnover, 1% bet commission, rescue loss, mystery and VIP EXP from play.
- [ ] VIP EXP per ৳1,000 bet, weekly Monday / monthly 1st timing; daily slot cashback (৳2,000+); app ৳52; member day 13th; real-time 3% rebate; 8x/1x turnover locks — not built.
- [ ] Red packet round success path and rescue claim before 10:00 not exercised live (time windows).

## 2026-11-02 08:03 request: full site plan, align site/admin/backend, test via master API
- [x] Inventoried pages, games, images, offers, admin sections, server files/tables; site plan saved to Files (bengalbet-site-plan.md).
- [x] Reconnected test server master API through a secure connection.
- [x] Deposit offer unified: one server config (admin editor in gateways tab, readback-verified), deposit endpoint uses it with opt-in and site min/max, member pages preview it. Live default kept at 5% every deposit.
- [x] Removed optimistic balance add and bogus reward claim after deposit requests.
- [x] Server + browser deposit tests on an isolated test member (limits, opt-out, bonus, approve once, reject). 37 tests pass.
- [ ] Waiting on user: which deposit offer is real (promo page says first deposit 47% min 500; notice says every deposit 47%; server gives 5%).
- [ ] Admin editor browser save not verified (needs separate admin login); server endpoint verified.

Current scope: implement the Bengali A-to-Z report on the user-designated test DBServer. Only isolated test accounts may undergo financial tests; unrelated members remain untouched. No background month-long monitoring is running.

Latest request (2026-11-02 06:51 UTC): continue games, referrals, remaining bonuses and admin controls, using isolated test members and safe test-server checks only.

## Verified this iteration
- [x] Connected BengalBet Server and inspected schema/source.
- [x] Stored protected rollback copies of seven PHP files and five settings/tier table snapshots; /data/ returns 403. This is not a full-database backup or restore drill.
- [x] Installed and browser-tested reads for all five previously missing reward-admin sections (daily, VIP, rescue, promos, mystery); authenticated responses 200.
- [x] Added validated daily-config POST and unified daily status/claim configuration on the server; claim uses transaction + user-row lock and daily bet threshold.
- [x] Daily member cards now use server schedule/eligibility, not hardcoded amounts; failed claims cannot fabricate client credits.
- [x] Actual browser login and daily claim on an isolated test member: reward 3.50, wallet increased exactly 3.50, repeat claim rejected 400, status hasSignedToday=true; wallet card read back 703.50. First reproduction exposed double credit; fixed settlement callback and retested with a fresh isolated member.
- [x] Removed repeat generic reward callbacks after successful promo/rescue/mystery settlements. Those flows still need independent end-to-end verification.
- [x] Notice editor/shared admin navigation and server-confirmed mystery timing gates implemented; desktop/mobile read views verified.
- [x] 19 automated tests passed; preview build OK. Synthetic 30/60-day eligibility tests are not real server settlement/load/uptime tests.

## Verified in current continuation
- [x] Activated admin VIP/rescue/promos/mystery settings controls and deleted temporary installers.
- [x] VIP unchanged save returned preserved birthdayBonus=50; fixed admin tier write endpoints.
- [x] Reproduced rescue create failure; diagnosed stale routing id, cleared it, then created inactive tier 9 and verified deactivate response. It remains an inactive audit artifact.
- [x] Created isolated promo +7; fresh actual browser registration, member redemption credited exactly 7 once; duplicate 400, zero-loss rescue 400, off-date mystery 400, ineligible VIP 400; zero page errors. Test promo deactivated.
- [x] Expired promo rejected 400, wallet unchanged and omitted from member list; test code deactivated.
- [x] Removed universal password fallback from live auth. Valid real test-member login succeeded afterward; fallback-negative test remains unverified.
- [x] Added server new-member task table and dedicated status/claim; current-day approved deposits/valid bets, sequential prior claim and earliest account day. This policy is an implementation assumption pending detailed offer approval.
- [x] Actual browser first task +10 exactly once, duplicate/early second-day 400, generic signin bypass 403; settled button disabled and wallet read back 517; zero page errors.
- [x] Generic mission/promo/signin cash claims disabled; unsupported offer paths now reject rather than credit without eligibility. Spin/egg/packet still require authoritative outcome work.
- [x] 21 permanent automated tests passed, preview build OK; both content route metadata inspected.

## Still open
Current release blockers are not all external: remaining feature implementation and full flow testing still need work. No claim of full-plan completion or production readiness is made.
- [ ] Daily manual-credit/reset, rescue review/manual grant and mystery manual issue/drop remain unimplemented; mystery config save not yet roundtrip-tested.
- [ ] Complete VIP earned-tier/activity requirements and advertised weekly/monthly timing; positive rescue/mystery and concurrent settlement tests. Current guarded server handles zero-loss/expiry/date/repeat checks, but exhaustive flow proof remains open.
- [ ] New-member days 2–12 positive boundary/concurrency/clock tests; admin editor actual authenticated browser save still needs verification. Server config persistence and member display are now implemented.
- [ ] End-to-end referral, deposits/withdrawals, remaining bonuses, achievements, event programs and each game's authoritative settlement.
- [ ] Complete editable banner/program/content settings and full administrator permissions audit.
- [ ] Full database backup/restore drill and separate scoped admin identity: hosting/identity facilities not verified.
- [ ] Scheduled 1–2-month observation: requires provisioned scheduler/monitoring; no unattended work runs after this turn.
- [ ] Legal/responsible-gaming and full regression release gates; not publish-ready.
- [ ] Test-account cleanup requires precise inventory and explicit deletion approval; none deleted.

## Verified 06:36 continuation
- [x] Added server new_member_config with validated 12-day definitions; preserved existing amounts and thresholds. Admin GET/POST/readback succeeded; invalid empty list 422; guest and member requests denied. Router action recognition corrected with backup.
- [x] Added editable admin task editor with enabled toggle, per-day requirement/amount/reward and persisted readback validation. Member labels/amounts now derive from server task definitions, no hardcoded display schedule.
- [x] Authenticated member browser: all 12 server tasks rendered; claimed first-day button disabled; duplicate/early claim rejected; wallet unchanged; zero page errors.
- [x] Live withdrawal now locks user row and atomically creates pending transaction/debits balance; validates configured limits, active account and destination; rejects another pending withdrawal.
- [x] Isolated concurrent two-withdrawal check: one pending transaction, one rejection, exactly 500 debited. Below/above/negative/zero amounts rejected. Admin cancellation refunded exactly 500; repeated cancellation no extra money; finalized transition reversal rejected.
- [x] Isolated test deposit 200 remained pending without credit; approval added stored amount+bonus=210 once. Repeated approval did not add money; subsequent rejection blocked. Test member balance read back 727.
- [x] Live transaction status and batch actions now use pending-to-final atomic guard. Ledger deletion, direct creation and financial amount edits disabled; note edits retained. Test finalized amount edit and deletion both 409. These restrictions need matching admin presentation updates.
- [x] 24 frontend tests and permanent PHP money/config tests passed; preview build OK. Protected source rollback copies retained; temporary installers removed.
- [ ] Deposit submission still uses old hardcoded 5% bonus/minimum; full authoritative offer config and idempotency remain incomplete. Pending withdrawal guard blocks repeats until finalization, not durable client request-key replay across finalization.
- [ ] Real browser withdrawal submission + admin approval interaction and complete live admin editor UI not yet exercised; server endpoint tests alone do not establish these UI flows.

## 2026-11-02 10:06 request: align page numbers with server rules
- [x] VIP pages (phone + computer): weekly/monthly bonus day from admin promo rules (was hardcoded Tuesday 6pm).
- [x] Referral (phone + computer): ladder = server per-friend bonus × first 5 qualified friends; fake 1,500/3,000/5,000 steps, sample friends/records and fake fallback earnings removed; server stats now report real counts/totals (uploaded, tested with a referred test member).
- [x] Reward center: fake fallback promo codes removed.
- [ ] Mission tables (26 bet targets) have no server rules or claims at all — need a server mission feature before they can match anything.
- [ ] Referral leaderboard amounts and poroskar level ladder are decorative; milestone claims are paused on the server.

## 2026-11-02 10:15 request: missions + referral leaderboard/levels on server, promo page + admin promo editor wired, plan doc, retest
- [x] Missions server rules/status/claim + admin edit (uploaded, tested with test member)
- [x] Referral leaderboard real data + level ladder claims (admin-editable; uploaded, tested)
- [x] Promotion page + admin promotion editor use server promo content (uploaded, tested)
- [x] Detailed plan document (/mnt/documents/bengalbet-site-plan_v3.md)
- [ ] Retest everything (mission page and admin screens not yet browser-tested; 20 custom games still demo-only; see Still open list)
