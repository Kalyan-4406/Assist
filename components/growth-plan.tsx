"use client";
import { useState } from "react";
import { forecast, cumulativePlan } from "@/lib/domain";
import { Download, ArrowUpRight } from "lucide-react";
export function GrowthPlan() {
  const [ambassadors, setAmbassadors] = useState(25),
    [rate, setRate] = useState(10),
    [lift, setLift] = useState(25);
  const p = forecast({
    ambassadors,
    reach: 130,
    joinRate: rate / 100,
    referralLift: lift / 100,
    direct: 100,
  });
  return (
    <div className="container plan-page">
      <h1>
        500 registrations.
        <br />
        <span style={{ color: "var(--blue)" }}>7 days. ₹2,000.</span>
      </h1>
      <p className="lead">
        A distribution plan built around campus peers, a useful first reward,
        and the students who actually show up.
      </p>
      <div className="plan-top">
        <strong>506</strong>
        <p>
          modelled registrations
          <br />
          Assumptions, not campaign results. Only a 6-registration margin.
        </p>
      </div>
      <a
        className="secondary-button"
        href="/submission/Growth_Plan.pdf"
        download
      >
        <Download size={18} />
        Download the 5-slide plan
      </a>
      <section className="plan-channels">
        {[
          {
            n: "01",
            title: "Campus ambassadors",
            body: "25 class reps and coding-club leads. Each reaches 130 students through relevant class, club and hostel groups. A 10% registration assumption produces 325 seats.",
            count: "325",
            spend: "₹900 proposed prizes",
          },
          {
            n: "02",
            title: "Race + referral loop",
            body: "Every student gets a college link and a Build Card. A 25% referral lift on ambassador registrations adds about 81. The Rising board keeps small campuses in the race.",
            count: "81",
            spend: "₹500 proposed rewards",
          },
          {
            n: "03",
            title: "Direct channels",
            body: "LinkedIn and Instagram posts plus permission-based messages to placement cells. Target 100 registrations from students without ambassador coverage.",
            count: "100",
            spend: "₹400 best-post boost",
          },
        ].map((c) => (
          <article className="plan-channel" key={c.n}>
            <span>{c.n}</span>
            <div>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
            </div>
            <b>{c.count}</b>
            <small>{c.spend}</small>
          </article>
        ))}
      </section>
      <p className="plan-note">
        ₹200 reserve brings the budget to exactly ₹2,000. Prizes, titles and
        rewards are proposals requiring NxtWave approval; they are not promised
        anywhere in the student flow. Channel share is about 64% campus, 16%
        referral and 20% direct under this forecast.
      </p>
      <section className="math-console">
        <h2>Stress-test the assumptions.</h2>
        <p className="plan-note">
          The baseline is fragile. Change activity or conversion and see the
          consequence.
        </p>
        <div className="math-controls">
          <label htmlFor="ambassadors">
            Active ambassadors<span>{ambassadors}</span>
            <input
              id="ambassadors"
              type="range"
              min="5"
              max="50"
              value={ambassadors}
              onChange={(e) => setAmbassadors(+e.target.value)}
            />
          </label>
          <label htmlFor="join-rate">
            Join rate<span>{rate}%</span>
            <input
              id="join-rate"
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(+e.target.value)}
            />
          </label>
          <label htmlFor="referral-lift">
            Referral lift<span>{lift}%</span>
            <input
              id="referral-lift"
              type="range"
              min="0"
              max="50"
              value={lift}
              onChange={(e) => setLift(+e.target.value)}
            />
          </label>
        </div>
        <div className="forecast-output" aria-live="polite">
          <strong>{Math.round(p.total)}</strong>
          <p>
            {Math.round(p.campus)} campus + {Math.round(p.referrals)} referral +
            100 direct
            <br />
            {p.total >= 500
              ? "Target reached in the model"
              : "Model misses 500 by " + Math.ceil(500 - p.total)}{" "}
            · break-even join rate {(p.breakEven * 100).toFixed(2)}%
          </p>
        </div>
        <div className="stress-tests">
          <button
            className="secondary-button"
            onClick={() => {
              setAmbassadors(25);
              setRate(7);
              setLift(25);
            }}
          >
            30% weaker pitch → 384
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setAmbassadors(15);
              setRate(10);
              setLift(25);
            }}
          >
            60% active ambassadors → 344
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setAmbassadors(25);
              setRate(10);
              setLift(25);
            }}
          >
            Reset baseline
          </button>
        </div>
        <small>
          Each extra active ambassador adds 16.25 registrations at baseline
          assumptions. Referral lift is applied once, not recursively.
        </small>
      </section>
      <section>
        <h2>The seven-day run.</h2>
        <div className="seven-day-plan">
          {[
            "First 10 campuses; inspect the funnel.",
            "Fix the largest registration drop.",
            "Recruit at stalled colleges.",
            "Below 240? Add active reps; boost the best post.",
            "Nudge with real campus counts.",
            "Highlight daily additions and referrals.",
            "Readiness push; use a real close time only.",
          ].map((action, i) => (
            <div key={i}>
              <b>DAY {i + 1}</b>
              <strong>{cumulativePlan()[i]}</strong>
              <p>{action}</p>
            </div>
          ))}
        </div>
        <p className="plan-note">
          Before launch: recruit 25 ambassadors; at least 15 confirmed to start.
          Daily: read the growth desk brief in the morning, prepare actions,
          inspect the funnel in the evening. No outreach is performed in this
          simulation.
        </p>
      </section>
      <section className="panel">
        <h2>Measure registrations. Design for attendance.</h2>
        <p className="plan-note">
          Track registrations vs plan, per-college view-to-seat ratio, referral
          share, share clicks per registration, and readiness completion.
          Readiness is a leading signal, not a proven attendance rate. With 24
          more hours: a consented two-college pilot, actual reminder delivery,
          optional squads and an evaluator for workshop projects.
        </p>
        <a className="text-button" href="/ops">
          Open the growth desk <ArrowUpRight size={17} />
        </a>
      </section>
    </div>
  );
}
