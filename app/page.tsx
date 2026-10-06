import Link from "next/link";
import { ArrowUpRight, Flag, ArrowRight, BarChart3 } from "lucide-react";
import { snapshot } from "@/lib/data";
import { CollegeSearch } from "@/components/college-search";
import { LiveRefresh } from "@/components/live-refresh";
export default async function Home() {
  const s = await snapshot();
  return <div className="container home">
    <section className="home-hero">
      <img className="workspace-photo" src="/images/build-workspace.webp" srcSet="/images/build-workspace-800.webp 800w, /images/build-workspace-1200.webp 1200w, /images/build-workspace.webp 1600w" sizes="(max-width: 700px) 100vw, (max-width: 1280px) calc(100vw - 80px), 1200px" alt="" width={1600} height={900} fetchPriority="high" />
      <div className="home-hero-copy">
        <h1>Your first AI project.<br />Your campus,<br /><span>behind you.</span></h1>
        <p className="lead">A free, one-hour workshop.<br />A project you can explain.</p>
        <div className="hero-actions"><a className="primary-button" href="#find-college">Find your college <ArrowRight size={19} /></a><Link prefetch={false} href="/race" className="hero-secondary">Explore the race</Link></div>
        <div className="workshop-meta"><span>60 minutes</span><span>Free online</span><span>{s.config.dateLabel}</span></div>
      </div>
      <div className="hero-progress"><BarChart3 size={18} /><div><p><strong>{s.total} / 500</strong> registration goal <span>· {s.hideDemo ? "Live registrations only" : "Includes labelled demo registrations"}</span></p><div className="progress-track"><span style={{width:Math.min(100,s.total/5)+"%"}} /></div></div></div>
    </section>
    <section className="home-search-section" id="find-college">
      <div className="section-intro"><h2>Find your people.<br /><span>Start with your college.</span></h2><p>Your campus page shows registrations, a place in the race, and a first project to make your own.</p>
        <aside className="race-summary"><div className="summary-title"><Flag size={20} /><span>Live race {s.hideDemo ? "" : "(demo data)"}</span><Link prefetch={false} href="/race" aria-label="Open the college race"><ArrowUpRight size={20} /></Link></div><small>Registrations by college</small><div className="mini-race">{s.colleges.slice(0,3).map(c=><Link prefetch={false} key={c.id} href={"/c/"+c.slug}><span>{c.rank}</span><span className="college-monogram">{c.name[0]}</span><strong>{c.name}</strong><b>{c.total}</b></Link>)}</div><p>{s.hideDemo ? "Showing live registrations only." : "Demo data — includes labelled demo registrations."}</p></aside>
      </div>
      <CollegeSearch colleges={s.colleges} />
    </section>
    <section className="journey-section"><h2>From curiosity to <span>a working project.</span></h2><p className="muted">A simple, focused journey — built for final-year students.</p><div className="outcomes home-outcomes"><div><strong>01</strong><div><h3>Pick a problem</h3><p>Choose a small idea you care about.</p></div></div><div><strong>02</strong><div><h3>Build with an AI API</h3><p>Make a simple tool using a hosted model.</p></div></div><div><strong>03</strong><div><h3>Leave with a working demo</h3><p>A first build you can show and explain.</p></div></div></div></section>
    <LiveRefresh />
  </div>;
}
