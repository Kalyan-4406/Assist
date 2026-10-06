# Campus Build Race — requirement audit

Live URL: https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site

This build implements the authorised product and prepares the submission materials. The supplied PDF is a specification, not proof that interviews, historic projects or submissions happened.

## Implementation

- Student app: search 40 seeded college names, add a college, campus count/rank/gap/50 goal, masked recent students, branch breakdown and fixed mobile claim action.
- Registration: branch + interest/free text, reward before personal data, 3 steps, preserved back navigation, one-hour session draft, explicit consent, email typo hint, honeypot, double-submit protection and database uniqueness.
- Resilience: saved offline submit resumes online and on reopening; timed client/server fallback; transient referral lookup failures preserve code; service recovery invalidates stale template caches.
- Confirmation/share: owned readiness, six-character code, hourly preview parameter, 3 R/P/F English/Hinglish angles, referral count, downloadable 1080×1350 PNG.
- Race: totals, last-24-hour Rising, global goal and campus-of-the-day.
- Protected ops: environment password, signed HttpOnly session, funnel/KPIs, daily pace, ambassador marking, angle attribution, stalled campuses, copied Morning Brief, health and safe CSV.
- Privacy: emails/names stay server-side; public names masked; code alone cannot authorise readiness edits; shared claims disclose included demo data.
- Demo seed: 120 fictional registrations in 15 campuses, individually marked is_demo, with a global operator hide/show switch. Real college metadata is not an affiliation claim.
- Storage: deployed D1 fallback selected by the user. Drizzle migration, Supabase SQL and server adapter included; Supabase integration is supplied but not connected/tested.
- AI: optional server Gemini integration with validation and timeout. No key was supplied. Build Cards and Morning Brief use explicitly labelled deterministic fallbacks. No paid quota claim or live model-success claim is made.
- Event configuration: date is to be announced. Calendar/group controls appear only after real date and official group environment settings exist.

## Verification evidence

Automated domain tests cover forecast, daily curve, validation, CSV/calendar safety and review regressions. Browser tests cover registration at 360px, preserved navigation, slow-card recovery and restored offline drafts. Integration tests cover duplicates, referral attribution, owner-only readiness, consent, ops protection, demo filtering and a 200-request rate-limit burst. Screenshots/browser reports are supplied locally.

Production deployment, signed-out browser checks, download checks and mobile Lighthouse measurements are recorded in Production_Verification.md after export. These automated checks do not claim to be five real students on phones or measured campaign conversion.

## Submission assets

Growth_Plan.pdf (five slides), AI_Learning_Notes.pdf (one page with three Ask → AI → Change examples), Question_6_Answer.pdf (one page), Submission_Summary.md, editable HTML/Markdown, Video_Script.md, Outreach_Kit.md, Final_Audit.md and a 2:55 demo MP4 with synthetic narration. The redesign and question 6 draft use the user's actual rejection of the first visual direction.

The refreshed UI uses generated realistic workspace imagery, tactile Build Cards and responsive mobile controls. The design studies, provenance and visual fidelity ledger are in campus-build-race/docs/redesign/. UI text and transactions remain native interactive elements.

## External work that cannot be truthfully invented

The latest completed redesigned-site Lighthouse run scored 58 for performance, below the brief's 90 target. Earlier runs and the final browser-probe failure are retained in the verification report. Functional assertions pass; this performance requirement is still open and is not presented as completed.

1. Applicant’s voice recording and personally reviewed reflections. Synthetic demo is a prepared asset; it does not satisfy the PDF’s own-voice requirement.
2. A genuine student quote, interviews and five unassisted real phone tests. Protocol supplied; none conducted by this build.
3. Official workshop date/time and WhatsApp group. User accepted withholding these until verified.
4. Real ambassador recruitment, 500 acquired students, campaign outreach and actual attendance. All growth numbers are forecasts or labelled demo data.
5. Official Google submission form URL and submission confirmation. Neither was supplied; nothing submitted and nobody contacted.

Optional squad mode, project evaluator, live reminders and an actual two-campus pilot are next-24-hour extensions in the brief.

## Operator handoff

Operator access details are in a private local file outside the public submission assets. Never publish that file. Runtime secrets are excluded from source archives and Git. Setup and event/model configuration are documented in the app README.
