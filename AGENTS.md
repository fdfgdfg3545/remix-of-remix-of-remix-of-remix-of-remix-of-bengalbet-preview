<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The imported BengalBet SPA lives in src/bengalbet (marked @ts-nocheck) and is rendered client-only by src/routes/index.tsx and the catch-all src/routes/$.tsx, because it does its own path-based view switching.
- Normalize public API origin and directory through the shared apiConfig module to prevent duplicated URL paths; operational credentials belong in the server-side connector, never frontend environment files.
- The root environment configuration may set the public default API URL; browser-local admin settings override that default, and reset restores it. Environment changes require a new deployment to affect the published app.
- Keep credential forwarding decisions in requestPolicy and test member/admin boundaries; legacy browser admin access is transitional and must not be expanded into demo bypasses or unrestricted proxies.
- Keep member mystery-claim eligibility in rewardEligibility and fail closed on missing server data; client checks prevent accidental claims but do not replace authoritative server validation.
- Keep notice editing in AdminSiteContent and confirm saves through settingsPersistence readback; a successful write response alone does not establish persisted member-visible settings.
- Keep admin message row normalization and create/delete readback in messagePersistence; legacy PHP rows use snake_case and successful writes alone do not prove persistence.
- Member promotion terms and titles derive from live server rules; suppress bundled banners with baked-in offer numbers when showing editable terms so printed claims cannot contradict current settings.
- Derive all administrator navigation surfaces from one tab list to preserve access and consistent labels.

- Completed server reward settlements notify the parent through onSettledReward for read-only wallet refresh; never forward them to the generic reward-claim callback, which would credit twice.
- Keep external PHP reward-source mirrors under server/dbserver/api for review; they are not the TanStack app runtime and live uploads require authenticated connector operations.

- New-member task claims submit only the task day to the dedicated server handler; server task state owns eligibility/claim status and settled wallet refresh prevents generic duplicate credits.
- New-member task definitions are persisted in one server configuration consumed by status and claims; admin edits require validated twelve-day definitions and readback verification, and member labels derive from those same definitions.
- External payment status changes use a transactional pending-to-final guard with locked transaction/user rows; finalized states are immutable and repeated identical decisions cannot credit or refund twice.
- Client-generated game outcomes are simulation-only and cannot update shared cash balances or submit automatic cash settlements; trusted server rounds are required before enabling real-money game settlement.
- Deposit bonus rules live in one server deposit offer config mirrored by depositOffer.ts and deposit_offer_rules.php; member pages only preview it, the deposit endpoint decides it, and approval credits the stored bonus once.
- Promotion grants (daily-login hammer, deposit eggs/wheel ticket, referral instant bonus, red packet rounds) are idempotent server grants in reward_grants.php keyed by member and grant key; never add client-side counters or credits for them.
- The DBServer runs on Bangladesh time because promotion schedules are defined in local time; date-based eligibility must use server time, never the browser clock.
- Member objects from the server pass through userMapping before entering site state, so reward counts and balances always reflect server values.
- Promotion timing and grant quantities live in one admin-editable promo_rules config mirrored by promoRules.ts and promo_rules.php; server handlers read it, admin saves are readback-verified, and reset deletes the stored row to restore the promo-page plan defaults.
- Agent-side DBServer master operations read the master key from the NEEXT_MASTER_KEY project secret (sent as X-Master-Key from the sandbox only); never place it in site code or browser storage.
- Real-money play goes only through server game rounds (game_rounds.php mirrored by gameRounds.ts): members send game and bet, the server picks the result from admin engine RTP/volatility/cap and settles in one locked transaction; custom game components stay demo-only until converted.
- Turnover offers (daily slot bonus, rebate, member day) are computed from server bet records in turnover_offers.php using promo_rules values and paid once through reward_grants keys.
- Before any task read CONTEXT.txt, MARKETING_PLAN.txt and TASKLIST.txt at the project root; after finishing a task mark it in TASKLIST.txt and append to CONTEXT.txt progress, because these files are the shared agent context.
- VIP levels are derived on the server by vip_progress.php (highest active tier whose bet and deposit targets are both met, never lowered) and synced on game rounds, deposit approval, balance reads and VIP claims; new members start at VIP0 with no free cash so every withdrawable credit passes the wagering rule.
- server/tests/sim_60days.ts replays 60 days of member activity against the server rules with an independent plan checker; re-run it after changing offer logic.
- The external PHP minute scheduler commits bounded member snapshots and VIP salary-card issuance with durable cursors under a connection-owned exclusive lock; it never credits wallets. Salary periods and per-member cards are unique, tier amounts are snapshotted per job, and only ownership-checked locked redemption credits a bonus ledger entry. HTTP uses a dedicated hashed key; cPanel CLI needs no HTTP credential.
- Wagering uses turnover_math: one common base multiplier for all new non-game-win credits, plus an additional multiplier only for the lifetime first approved deposit bonus; return of withheld funds is not a new grant. Check withdrawals under the member lock and ledger admin credits by positive delta to prevent accounting bypasses.
- Mystery rules are shared by admin/public/cron; immutable monthly card jobs issue without wallet credit, and owned-card redemption alone writes the common bonus ledger, preventing direct-claim/cron double awards.
- Withdrawal inactivity state is durable and shared by deposit approval, the minute cron and locked submission; snapshot available balance before mutations and preserve partial-deposit progress so retries cannot reset the target. Legacy missed expiry snapshots record observation time rather than claiming historical precision.
- All bonus cash, reward grants and scheduled cards require recipient lifetime approved positive deposits; guard before mutation and keep first-deposit approval's own stored bonus eligible within its transaction.
