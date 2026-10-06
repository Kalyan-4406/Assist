# Campus Build Race

A working NxtWave Growth Challenge demo with college pages, three-step registration, personal Build Cards, referrals, a college race, readiness tracking and a protected growth desk. The redesigned interface uses generated workspace imagery and responsive native controls.

[Live app](https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site) ? [Submission kit](https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site/submission) ? [2:55 demo video](https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site/submission/Campus_Build_Race_Demo.mp4)

## Run locally

Requires Node.js 22.13 or later. Copy `.dev.vars.example` to `.dev.vars`, set your own `OPS_PASSWORD` and a random `SESSION_SECRET` of at least 32 characters, and set `PUBLIC_SITE_URL` to your local origin. Keep `.dev.vars` private.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chubby_imperial_guard.sql
npm run dev -- --port 5173 --hostname 127.0.0.1
```

Apply the migration once to a fresh local database. Idempotent first-access seeding creates 40 campus records and 120 explicitly fictional registrations. `npm run db:generate` generates future schema migrations.

On Windows, if the npm shell shim fails in a OneDrive path, replace `npm` with `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js"`.

## What is included

- `app/`, `components/`, `lib/`: routes, interface, validation, cookies, API and operational logic.
- `db/`, `drizzle/`: active durable D1 database schema and migration.
- `build/`, `scripts/`, `.openai/hosting.json`: required Vinext/Cloudflare build integration, local tooling and verification commands.
- `public/`: production WebP images, required fonts and small submission documents.
- `tests/`: domain, privacy, mobile navigation, registration and resilience checks.
- `supabase/schema.sql`, `lib/supabase-adapter.ts`: optional alternative schema/transport, currently inactive and untested against an account.
- `AI_LOG.md`, `DECISIONS.md`, `docs/ASSETS.md`: learning notes, implementation judgment and asset provenance.

The five-slide Growth Plan, AI Learning Notes, Question 6 answer and supporting submission documents are in `public/submission/`. The video link points to the existing hosted MP4, keeping recordings out of Git. The complete editable video source remains in the original workspace's separate `submission-video/` folder.

## Configuration

| Variable | Purpose |
| --- | --- |
| `OPS_PASSWORD` | Your protected growth-desk password |
| `SESSION_SECRET` | Random secret of at least 32 characters for signed cookies |
| `PUBLIC_SITE_URL` | Your app's absolute origin |
| `CAMPAIGN_START` | ISO date for the simulated seven-day campaign |
| `WORKSHOP_DATE_LABEL` | Defaults to Date to be announced |
| `WORKSHOP_DATE_ISO` | Optional confirmed date/time for calendar actions |
| `WORKSHOP_GROUP_URL` | Optional official WhatsApp group URL |
| `GEMINI_API_KEY` | Optional server-only key; curated fallback works without it |
| `GEMINI_MODEL` | Optional model name |
| `CAMPUS_GOAL` | College goal; defaults to 50 |

`.openai/hosting.json` retains the D1 binding configuration without the original hosted project ID. Configure production runtime secrets and storage on your own hosting project before deploying.

## Verification

```sh
node --experimental-strip-types --test tests/domain.test.mjs tests/review-regressions.test.mjs
node node_modules/typescript/bin/tsc --noEmit
node node_modules/@playwright/test/cli.js test
```

Browser checks require a running local app and Playwright Chromium (`npx playwright install chromium`). Optional QA/report scripts write to a sibling `deliverables/` folder; create that folder first. Run `scripts/integration.mjs` only against an isolated local QA database: it creates records and deliberately tests rate limits. Scripts named `verify-production` and `verify-downloads` check the original public demo.

## Honest limits

Registration writes, referral attribution, aggregate counts, private readiness and operator exports are real functionality. Seeded users and the campaign are labelled simulations. Public pages mask names and never expose emails. A share code alone cannot authorize private updates.

The optional Gemini integration is inactive without a key and explicitly uses template fallbacks. Workshop date and official WhatsApp group were not supplied. The latest completed live Lighthouse performance score was 58/100, below the brief's 90-point target; accessibility was 100 and SEO 92 on that run. No real student interviews, campaign outcomes or official submission are claimed. The video uses labelled synthetic narration; record your own voice if required by the brief.

This repository excludes secrets, dependencies, database state, build output, reference mockups, screenshots, generated recordings, large archives, unused starter UI components and the original publishing history.
