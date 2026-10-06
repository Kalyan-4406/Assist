# AI assistance log

Only events in this session are recorded. The PDF's historical entries are unverified and are not reused as personal experience.

## Entry 1 — 4 October 2026: Database choice
What was asked: Read the supplied PDF and build the entire submission kit, continuously.
AI identified: Supabase is not connected; proposed a durable hosted fallback and a portable Supabase schema.
User changed/accepted: Explicitly selected “Use the durable fallback”.
Why: Complete a functional persisted demo without blocking on a database account connection.

## Entry 2 — 4 October 2026: Missing event configuration
What was asked: Whether workshop date/time and official WhatsApp group URL were available.
AI suggested: Show Date to be announced and hide the group button until supplied.
User response: “ok”.
Why: The brief prohibits invented dates and perks. Calendar events must wait for a real timestamp.

## Implementation observations
Entry 3 — Independent review found demo labels lost in copied text, transient referral errors dropping valid codes, offline drafts not resuming after reopen and template caches not recovering once a model is configured. The build agent accepted these findings and fixed the paths. Regression tests cover all four. Further browser checks found a production share-kit hydration mismatch; referral URLs now match the server through initial hydration. These are agent implementation choices, not the applicant’s claimed historical rejections.

Performance work: replaced an unused UI wrapper in the critical form, inlined the small custom stylesheet, subset the display font to WOFF2 and disabled incompatible framework prefetch. Before the redesign, production mobile Lighthouse measured 95 performance and 2.2s LCP under simulated 4G. These are historical baseline numbers. Current measurements are in ../deliverables/performance-summary.json. The hosting platform's Cloudflare challenge script has a deprecation warning, independently identified in the audit.

## Entry 3 — 5 October 2026: Reject the first visual direction
What was asked: “change the ui i need a hyper realistic ui”, plus the four submission items and an answer to question 6.
AI had produced: A functional flat blue-and-white interface.
User changed: Explicitly rejected that visual direction and requested greater realism.
Implementation: Built-in Image Gen supplied realistic workspace imagery and references. Native HTML/CSS now provides photo framing, cobalt tactile Build Cards and clearer mobile hierarchy. Existing consent, referrals and the three registration steps remain functional. Browser testing found a fixed-action stacking problem; portalling the action and hiding it during the dialog repaired the flow. Review found missing mobile navigation and low-contrast empty-campus copy; both were fixed.
Judgment: The generated reference's unsupported “no real student data collected” copy was discarded because the real app collects consented contact details. All student totals still come from durable records and demonstration data is labelled. This entry supports the applicant-reviewed question 6 draft; it does not invent historical personal projects.

Redesign performance: initial live photography version measured 88 performance / 100 accessibility / 100 SEO, so responsive 800/1200/1600px WebP sources were added. Review showed React cache did not deduplicate the installed framework's metadata/page reads; it was replaced with a smaller metadata aggregate query. Production testing also exposed framework-link navigation failing after immediate menu dismissal; the menu now uses ordinary document links. Final measured results are recorded in Production_Verification.md.
