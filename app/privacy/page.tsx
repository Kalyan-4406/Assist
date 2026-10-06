import Link from "next/link";
export const metadata = { title: "Privacy and consent" };
export default function Privacy() {
  return (
    <article className="container prose">
      <h1>Your details stay private.</h1>
      <p className="lead">
        This is an independent NxtWave Growth Challenge simulation. It is not an
        official NxtWave registration system.
      </p>
      <h2>What we collect and why</h2>
      <p>
        We store your name, email, college, branch and year to record workshop
        interest and attribute campus registrations. Your selected project,
        referral code, email consent timestamp and readiness checklist are also
        saved. No phone number, medical record or financial record is requested.
      </p>
      <h2>What others can see</h2>
      <p>
        Public pages show college counts, branches, first names with last
        initials, and share codes. Emails and full names are restricted to the
        password-protected growth desk. Public referral links do not let others
        update your checklist.
      </p>
      <h2>Your email consent</h2>
      <p>
        The registration checkbox records permission to email workshop details.
        This demo does not send any emails, WhatsApp messages or reminders. A
        real campaign would require NxtWave approval and a configured email
        provider.
      </p>
      <h2>Cookies and device storage</h2>
      <p>
        A signed HttpOnly cookie identifies the browser that owns a
        registration. A separate operator cookie protects the growth desk.
        Device session storage keeps your unfinished registration for up to one
        hour and saves a queued offline submission for retry. There is no
        advertising tracker. Losing the owner cookie means the public share link
        cannot restore private checklist access.
      </p>
      <h2>Security and retention</h2>
      <p>
        Submissions are rate limited using a salted hash of the network IP,
        without storing the raw IP. Anonymous funnel events use a random session
        ID. Fictional demo rows are flagged and labelled. Operators should
        remove trial registrations and campaign records when evaluation ends,
        rotate credentials before real use, and provide an official contact and
        retention policy before outreach.
      </p>
      <p>
        This simulation is for evaluation; use a test email rather than personal
        contact information.
      </p>
      <Link prefetch={false} className="text-button" href="/">
        Back to your college →
      </Link>
    </article>
  );
}
