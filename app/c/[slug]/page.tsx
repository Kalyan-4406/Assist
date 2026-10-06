import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Wifi } from "lucide-react";
import { collegeBySlug, collegeMetadata, publicConfig } from "@/lib/data";
import { templateCard } from "@/lib/domain";
import { Registration } from "@/components/registration";
import { BuildCard } from "@/components/build-card";
import { ProgressRing } from "@/components/progress-ring";
import { LiveRefresh } from "@/components/live-refresh";
import type { Metadata } from "next";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await collegeMetadata(slug), config = publicConfig();
  if (!c) return { title: "College not found" };
  return {
    title: c.name,
    description: `${c.total} from ${c.name} are registered. Choose your first AI project and join a free workshop. Demo counts are labelled.`,
    openGraph: {
      title: `${c.total} from ${c.name} are in`,
      description: `Join your campus in the Build Race · free AI workshop · ${config.dateLabel}`,
      url: config.siteUrl + "/c/" + slug,
      images: [
        {
          url: config.siteUrl + "/api/og/" + slug,
          width: 1200,
          height: 630,
          alt: `${c.name} campus registrations`,
        },
      ],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
export default async function CollegePage({ params }: Props) {
  const { slug } = await params;
  const { college: c, snapshot: s } = await collegeBySlug(slug);
  if (!c) notFound();
  const next = s.colleges.find((x) => x.rank === c.rank - 1),
    gap = next ? next.total - c.total + 1 : 0;
  return (
    <div className="container college-page">
      <Link prefetch={false} href="/" className="back-link">
        <ArrowLeft size={18} />
        All colleges
      </Link>
      <section className="college-hero">
        <img className="workspace-photo" src="/images/build-workspace.webp" srcSet="/images/build-workspace-800.webp 800w, /images/build-workspace-1200.webp 1200w, /images/build-workspace.webp 1600w" sizes="(max-width: 700px) 100vw, (max-width: 1280px) calc(100vw - 80px), 1200px" alt="" width={1600} height={900} fetchPriority="high" />
        <div className="campus-proof">
          <h1>{c.name}</h1>
          <p className="location">
            {c.city} · {c.state}
          </p>
          <div className="campus-count">
            <strong>{c.total}</strong>
            <span>
              classmates
              <br />
              registered to build
            </span>
          </div>
          <p className="rank-line">
            <strong>#{c.rank}</strong> in the Build Race
          </p>
          {next && (
            <p className="rank-gap">
              {gap} more to pass {next.name}
            </p>
          )}
          <div className="branch-counts">
            <h2>Students across branches</h2>
            <div>
              {Object.entries(c.branches).map(([branch, count]) => (
                <span key={branch}>
                  {branch}
                  <b>{count}</b>
                </span>
              ))}
              {!c.total && (
                <p className="muted">
                  Be the first to put your campus on the board.
                </p>
              )}
            </div>
          </div>
          {!!c.recent.length && (
            <div className="recent-students">
              <h3>
                {s.hideDemo
                  ? "Recent registrants"
                  : "Recent registrants · includes fictional demo names"}
              </h3>
              <div>
                {c.recent.map((name, i) => (
                  <span
                    className="avatar"
                    key={i}
                    title={name}
                    aria-label={name}
                  >
                    {name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                ))}
              </div>
              <small>{c.recent.slice(0, 3).join(" · ")}</small>
            </div>
          )}
          <Registration college={c} config={s.config} />
        </div>
        <div className="campus-card">
          <BuildCard card={templateCard("Placements", "CSE/IT")} />
        </div>
      </section>
      <section className="outcomes">
        <div>
          <strong>01</strong>
          <h3>Pick a problem</h3>
          <p>Choose a real student problem to solve.</p>
        </div>
        <div>
          <strong>02</strong>
          <h3>Build with an AI API</h3>
          <p>Get hands-on with a hosted AI model.</p>
        </div>
        <div>
          <strong>03</strong>
          <h3>Leave with a working demo</h3>
          <p>A project you built, in just one hour.</p>
        </div>
        <div className="outcome-details">
          <p>
            <CalendarDays size={20} />
            {s.config.dateLabel}
          </p>
          <p>
            <Wifi size={20} />
            Free online workshop
          </p>
        </div>
      </section>
      <section className="campus-lower">
        <div className="panel">
          <div className="panel-heading">
            <h2>Campus race</h2>
            <Link prefetch={false} href="/race" className="text-button">
              Full board <ArrowUpRight size={16} />
            </Link>
          </div>
          {s.colleges.slice(0, 3).map((x) => (
            <Link prefetch={false} className="campus-race-row" key={x.id} href={"/c/" + x.slug}>
              <span>{x.rank}</span>
              <strong>{x.name}</strong>
              <div className="race-bar">
                <span
                  style={{
                    width:
                      Math.max(
                        3,
                        (x.total / Math.max(1, s.colleges[0].total)) * 100,
                      ) + "%",
                  }}
                />
              </div>
              <b>{x.total}</b>
            </Link>
          ))}
        </div>
        <div className="panel campus-goal">
          <h2>Your campus goal</h2>
          <div>
            <ProgressRing value={c.total} goal={s.config.campusGoal} />
            <p>
              Help {s.config.campusGoal} classmates at {c.name} join the Build
              Race.
            </p>
          </div>
          <small>A stronger peer group builds a stronger you.</small>
        </div>
      </section>
      <LiveRefresh />
    </div>
  );
}
