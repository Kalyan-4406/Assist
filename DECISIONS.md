# Decisions — 4 October 2026

- Continuous execution: the user's request overrides the PDF's example stop/wait prompts.
- Durable fallback: user explicitly chose this after Supabase reported not connected. Use D1 on Sites, retaining Next.js App Router source and a Postgres/RLS schema.
- Workshop date/group: unknown; show Date to be announced and omit group/calendar links until configured.
- Five-person field test and historical AI stories: do not fabricate. Automated timing is an automated test, not a field median.
- Public referral codes are share identifiers. Private sessions protect readiness and contact records.
- Duplicate email recovers only the current owner's details; otherwise returns a neutral already-registered message.
- Plan percentages are daily increments; cumulative day-4 target is 240.
- Prefer explicit deterministic templates over pretending an unconfigured LLM ran.
- Generated concept: blue campus passport motif, code-native UI, no photo dependencies.
# Redesign update — 5 October 2026

The user rejected the first visual direction. The redesign uses a generated realistic workspace image and native, selectable Build Card content. It adds a mobile navigation menu and retains the reward-before-contact flow. Images are responsive WebP assets; metadata reads a small aggregate query instead of duplicating the full operational snapshot. Review showed React cache cannot deduplicate metadata/page reads in the installed framework, so that attempt was removed. Generated references cannot override accurate privacy claims or durable counts. See docs/redesign/design.md and the final fidelity ledger.

Performance investigation: successful seed initialization is memoized by the actual D1 binding (failed initialization is evicted for retry). Mutable configuration and registration data remain fresh. Snapshot reads use one prepared-statement batch instead of six separate calls, as described in [Cloudflare's D1 batch documentation](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch). All 30 integration checks passed after this change. Public performance results are reported honestly, including lower earlier runs; the platform-injected challenge script is not blocked or filtered.

The shared layout only needs the demo-visibility setting. It now reads that setting directly instead of recomputing the entire operational snapshot on every page. The generic head description is retained because the installed framework streams route-specific metadata into the body and Lighthouse cannot see it in the head. Route-specific metadata remains available; the verification selector explicitly reads its last description. This is a documented framework limitation, not an invented per-campus SEO claim.
