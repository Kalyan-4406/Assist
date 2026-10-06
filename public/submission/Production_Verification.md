# Production verification — refreshed UI and submission

Final metadata correction: the generic description was restored in the document head because this framework streams route metadata into the body. The category scores below are from the last completed Lighthouse run before that correction. The final repeat audit was interrupted by Chromium closing its target during benchmark setup (`Runtime.evaluate: Target closed`); it did not produce a replacement score. All 11 published download hashes matched the local files, and final head metadata is checked separately. The 90-point live performance requirement remains unfulfilled.

Public URL: https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site

Updated 5 October 2026 (India time). JSON reports contain UTC measurement timestamps.

The published app was checked in fresh signed-out Chromium at 360px: home, campus, race, plan, privacy, submission and public share-kit routes loaded without overflow or runtime errors. **48 production assertions passed**; one additional report entry records MP4 metadata. Checks cover durable registration, QA exclusion from real totals, referral attribution, duplicate privacy, owner-only readiness, protected CSV, live demo hiding, metadata demo filtering, Morning Brief output and public PDF/Markdown/media downloads. See production-verification.json, measured 2026-10-05T05:32:53.767Z.

**Eight live browser tests passed**, with no failures or flaky results. These verify mobile plan/submission navigation, full registration, preserved back navigation, delayed-card fallback, reopened offline submission, expired drafts, required consent and share-kit hydration/angle/demo labels. See production-browser-tests.json. Domain/review regression tests: 11 passed. After the read-query optimization, all 30 local integration cases passed, including a 200-request atomic-rate-limit burst on the local QA database. No burst was run against production.

Mobile Lighthouse on the public campus page: **performance 58; accessibility 100; SEO 92; best practices 82**. FCP 1.8 s; LCP 2.7 s; TBT 2,280 ms; layout shift 0. The profile simulates 4G and a 4× CPU slowdown. Measurement: 2026-10-05T05:31:02.463Z. The latest controlled run remains below the brief's 90-point performance target. This is a measured limitation, not a passed requirement.

Repeated hosted runs showed variable document latency. Earlier redesign audits (including a 59-point cold run) are retained rather than discarded. The platform Cloudflare challenge script contributes CPU work and uses a deprecated persistent-storage API; the app cannot remove this injected script. The latest score is reported as measured, with no filtering. Initial visual version scored 88. Responsive WebP delivery, smaller metadata reads, successful seed initialization per database binding and batched snapshot reads reduce app-controlled overhead. These optimizations do not cache mutable counts or demo settings across visitors.

The full-page and state design studies were compared with published desktop/mobile screenshots using view_image. Browser/IAB was unavailable, so Playwright Chromium captured 1024×1536 home, 1374×1145 campus and 360×800 mobile views. Copy, section order, typography, palette, photo framing, card geometry and native controls were inspected. Intentional adaptations and fixes are documented in campus-build-race/docs/redesign/fidelity-ledger.md.

PDF export checked: five growth-plan pages, one learning-notes page with three Ask → AI → Change examples, and one Question 6 answer page. Editable HTML/Markdown, the forecast curve and screenshot evidence accompany them. Question 6 records the user's actual rejection of the initial flat UI.

Video footage is from the actual public site at 360×800, with fictional QA details and zero captured page errors. Operator authentication was set before recording; no password, tabs or bookmarks appear. Narration is clearly labelled synthetic. Final MP4: **175.1 seconds, 1920×1080, 20.0 fps**, 6,560,620 bytes. Audio was normalized with a -16 LUFS target and -1.5 dB true-peak ceiling. Representative exported frames and signed-out public playback were checked.

Prepared assets do not invent personal or field work. Still unverified: an external model provider (no key), five people on real phones/mobile data, a genuine student quote, the applicant's own voice and personal history, real conversion/attendance and official form submission. The original brief's own-voice requirement needs the applicant's recording; a timed script is supplied.
