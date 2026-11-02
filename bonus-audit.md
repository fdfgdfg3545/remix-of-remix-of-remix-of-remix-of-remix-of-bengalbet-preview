# Bonus alignment audit — 2026-11-02

## Verified live
- Implementation follow-up: secure connection restored and current mystery PHP read via Master API. All five bonus-admin reads again returned 404. The mystery claim handler still has the default award path without matching status eligibility checks; no PHP upload was made.
- Authenticated notice editor read tested on desktop and mobile; bilingual selection worked, no page errors or mobile horizontal overflow. No production save/claim/financial mutation was performed.
- 17 current focused tests passed, including save/readback failure handling and 30/60-day synthetic cohort checks. Synthetic cohorts verify the frontend mystery gate only, not server eligibility, registration throughput, referrals, wallets, settlement or uptime.
- Follow-up at 04:23 UTC: the user-supplied administrator credential was accepted by the actual admin login page (HTTP 200 and authenticated session). It was used once and not added to project files. This verifies the legacy login only, not a separate scoped admin identity or all admin sections.
- Follow-up wallet check: the same audit member logged in, balance read twice as 500, wallet-card and transaction reads succeeded, and the successful 500 welcome-bonus transaction matched the balance. No financial mutation was performed.
- The newly linked BengalBet Server connection can read the current PHP source and database schema.
- All five administrator sections return HTTP 404: daily-signin/config, vip/stats, rescue/tiers, promos, mystery-reward/config. These are missing PHP handlers, not merely frontend navigation failures.
- One new isolated audit member registered through the browser; the same account subsequently logged in successfully. No other member was accessed.
- Wallet and member daily-signin, VIP, rescue, promo and mystery status reads succeeded with no browser page errors. The audit member balance remains 500 after read-only checks; no bonus claim, deposit or withdrawal was submitted.
- Browser rendering of the mystery modal with that member's real status showed the claim button disabled. This was an isolated component check; ordinary navigation to that modal was not verified.
- Eleven focused automated tests passed; preview build output reports build OK.

## Actual workflow and discrepancies
| Feature | Current server behavior | Alignment problem |
| --- | --- | --- |
| Welcome | Registration directly creates balance 500, five spins, one egg, three packets and a welcome transaction | These values are hardcoded in auth.php, not demonstrated adjustable admin settings |
| Daily sign-in | Status calculates 1 + day × 1.5; claim calculates 2 + day × 1.5; cycle is 30 | First-day preview 2.50 differs from credit 3.50; missed-day and rollover calculation differs between status and claim; no administrator config handler |
| VIP | Claim selects requested tier and type and credits its configured amount | No tier eligibility or repeat-claim validation in inspected claim source; a nonpositive or unknown reward falls back to 50 |
| Rescue | Status uses loss and active tier; claim adds a consolation fallback | With zero loss the status shows zero but claim code awards 10; caller-supplied date is not bounded |
| Promo codes | Checks active code, usage limit, prior redemption and minimum VIP | No expiry validation in inspected redeem code; all types are credited as cash rather than separate percentage/free-spin fulfillment |
| Mystery | Status reports the 23rd after 18:00 and monthly bet threshold 500 | Claim checks previous claim but not date/time, betting eligibility or verification; defaults to 2500. Status omits editable config |

Marketing promises therefore cannot be certified: signup → benefit eligibility → claim → wallet credit → transaction must use the same server-authoritative rules at every step. Current preview/credit, eligibility and configurable-setting differences break that chain.

## Safe frontend corrections completed
- Mystery reward now fails closed on absent eligibility data, closed events, existing claims and disabled config; in-flight claims cannot be repeated.
- The mystery claim gate additionally requires explicit server is23rdToday and isPast6PM flags; client time cannot open the gate. This deliberately blocks out-of-day unlocked cards under the current incomplete contract until a server-authoritative expiry/window contract is available.
- Removed fabricated mystery wager progress and hardcoded promo-code copying; reads actual status/config instead.
- Rescue, promo and mystery administrator load failures clear stale records and display an error rather than pretending that an empty list means success.

## Blocked work
- Adding or modifying live administrator/financial handlers requires a protected restorable backup and a separate staging DBServer with isolated funds. Neither has been supplied or verified. No live PHP uploads were made.
- Full privileged admin workflow checks still require a distinct scoped administrator session. The legacy user-entered admin login succeeded, but the operational connector credential must not be copied into browser storage as a login.
- Source inspection found a universal password fallback in live auth.php; this needs removal and staging regression before marketing or real-money use. No attempt was made to exploit it or access another member.
- Award claims, duplicate/concurrent settlement, editable admin settings, referral eligibility and all other promotion types remain unverified end-to-end.