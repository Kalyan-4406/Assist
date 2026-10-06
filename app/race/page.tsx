import Link from "next/link";
import { ArrowUpRight, TrendingUp, Flag } from "lucide-react";
import { snapshot } from "@/lib/data";
import { LiveRefresh } from "@/components/live-refresh";
export default async function Race({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const s = await snapshot(),
    rising = (await searchParams).tab === "rising";
  const board = rising
    ? [...s.colleges].sort(
        (a, b) =>
          b.rising - a.rising ||
          b.total - a.total ||
          a.name.localeCompare(b.name),
      )
    : s.colleges;
  const star = [...s.colleges].sort((a, b) => b.today - a.today)[0];
  return (
    <div className="container race-page">
      <section className="race-heading">
        <div>
          <h1>
            Build together.
            <br />
            <span>Climb together.</span>
          </h1>
          <p className="lead">
            Every registration plants your campus flag.
            <br />
            Small campus? The Rising board is yours to climb.
          </p>
        </div>
        <div className="race-total">
          <strong>{s.total}</strong>
          <span>of 500 registrations</span>
          <div className="progress-track">
            <span style={{ width: Math.min(100, s.total / 5) + "%" }} />
          </div>
          <small>
            {s.hideDemo ? "Live registrations" : "Includes demo data"}
          </small>
        </div>
      </section>
      {star?.today > 0 && (
        <div className="campus-of-day">
          <Flag size={22} />
          <span>
            Campus of the day<strong>{star.name}</strong>
          </span>
          <b>
            +{star.today}
            <small>today</small>
          </b>
          <Link prefetch={false} href={"/c/" + star.slug} aria-label={"Open " + star.name}>
            <ArrowUpRight size={22} />
          </Link>
        </div>
      )}
      <div
        className="race-tabs"
        role="navigation"
        aria-label="Leaderboard ranking"
      >
        <Link prefetch={false} className={!rising ? "active" : ""} href="/race">
          All-time registrations
        </Link>
        <Link prefetch={false} className={rising ? "active" : ""} href="/race?tab=rising">
          <TrendingUp size={17} />
          Rising · last 24h
        </Link>
      </div>
      <div className="leaderboard">
        <div className="leaderboard-labels">
          <span>RANK</span>
          <span>COLLEGE</span>
          <span>{rising ? "LAST 24H" : "REGISTERED"}</span>
          <span>TODAY</span>
          <span />
        </div>
        {board
          .filter((c) => c.total > 0)
          .map((c, i) => (
            <Link prefetch={false} className="leaderboard-row" key={c.id} href={"/c/" + c.slug}>
              <span className={"rank-number " + (i < 3 ? "top-rank" : "")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <strong>{c.name}</strong>
                <small>
                  {c.city}, {c.state}
                </small>
              </span>
              <b>{rising ? c.rising : c.total}</b>
              <span className="today-count">+{c.today}</span>
              <ArrowUpRight size={20} />
            </Link>
          ))}
        {!s.total && (
          <div className="empty">
            <Flag size={34} />
            <h2>The race starts with one person.</h2>
            <p>Find your college and claim the first seat.</p>
            <Link prefetch={false} className="primary-button" href="/">
              Find your college →
            </Link>
          </div>
        )}
      </div>
      <LiveRefresh />
    </div>
  );
}
