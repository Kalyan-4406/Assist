"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Download,
  LogOut,
  Sparkles,
  Check,
  Copy,
  RefreshCw,
  LockKeyhole,
} from "lucide-react";
import { api } from "@/lib/client";
import { cumulativePlan } from "@/lib/domain";
import type { Snapshot, Brief } from "@/lib/types";
export function OpsDashboard() {
  const [stats, setStats] = useState<Snapshot | null>(null),
    [auth, setAuth] = useState<boolean | null>(null),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [brief, setBrief] = useState<Brief | null>(null),
    [copied, setCopied] = useState<number | null>(null),
    [code, setCode] = useState("");
  const load = useCallback(async () => {
    try {
      const s = await api<Snapshot>("ops/stats");
      setStats(s);
      setAuth(true);
      setError("");
    } catch (e) {
      setAuth(false);
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("ops/login", { password });
      setPassword("");
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function getBrief() {
    setBusy(true);
    setError("");
    try {
      setBrief(await api<Brief>("ops/brief", {}));
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (auth === null)
    return (
      <div className="container page-skeleton" role="status">
        <div />
        <div />
        <span>Opening the growth desk…</span>
      </div>
    );
  if (!auth || !stats)
    return (
      <section className="ops-login">
        <LockKeyhole size={35} />
        <h1>The growth desk.</h1>
        <p>
          Campus signals. Clear next actions.
          <br />
          Private access for the campaign operator.
        </p>
        <form onSubmit={login}>
          <label htmlFor="ops-password">Operator password</label>
          <input
            id="ops-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="primary-button" disabled={busy}>
            {busy ? "Checking access…" : "Open growth desk →"}
          </button>
        </form>
        {error && error !== "Sign in to the growth desk first." && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    );
  const target = cumulativePlan()[stats.config.day - 1],
    funnel = [
      { name: "College-page views", value: stats.funnel.views },
      { name: "Registration starts", value: stats.funnel.started },
      { name: "Build Cards shown", value: stats.funnel.cards },
      { name: "Seats claimed", value: stats.funnel.submitted },
    ];
  const stalled = [...stats.colleges]
    .filter((c) => c.views > 0)
    .sort((a, b) => b.views - b.total - (a.views - a.total))[0];
  return (
    <div className="container ops-page">
      <div className="ops-heading">
        <div>
          <h1>The growth desk.</h1>
          <p>
            Day {stats.config.day} of 7 · 500 registrations, one campus at a
            time.
          </p>
        </div>
        <div className="ops-tools">
          <button
            className="icon-button"
            aria-label="Refresh dashboard"
            onClick={load}
          >
            <RefreshCw size={19} />
          </button>
          <a className="secondary-button" href="/api/ops/export">
            <Download size={17} />
            Export CSV
          </a>
          <button
            className="icon-button"
            aria-label="Sign out"
            onClick={async () => {
              await api("ops/logout", {});
              setAuth(false);
              setStats(null);
              setBrief(null);
            }}
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
      <div className="ops-data-strip">
        <label>
          <input
            type="checkbox"
            checked={!stats.hideDemo}
            onChange={async (e) => {
              try {
                const s = await api<Snapshot>("ops/demo", {
                  hidden: !e.target.checked,
                });
                setStats(s);
                setBrief(null);
              } catch (error) {
                setError((error as Error).message);
              }
            }}
          />{" "}
          Include demo data
        </label>
        <span>
          {stats.demoTotal} fictional demo records · {stats.liveTotal}{" "}
          non-demo registrations
        </span>
      </div>
      <div className="kpi-strip">
        <div>
          <span>REGISTRATIONS</span>
          <strong>
            {stats.total}
            <small>/ 500</small>
          </strong>
          <p>{target} expected by today</p>
        </div>
        <div>
          <span>PAGE → SEAT</span>
          <strong>
            {stats.funnel.views
              ? Math.round((stats.total / stats.funnel.views) * 100)
              : 0}
            <small>%</small>
          </strong>
          <p>{stats.funnel.views} college-page sessions</p>
        </div>
        <div>
          <span>REFERRAL SHARE</span>
          <strong>
            {stats.total
              ? Math.round((stats.referrals / stats.total) * 100)
              : 0}
            <small>%</small>
          </strong>
          <p>{stats.referrals} attributed registrations</p>
        </div>
        <div>
          <span>READY TO BUILD</span>
          <strong>
            {stats.ready}
            <small>/ {stats.total}</small>
          </strong>
          <p>All three checklist items complete</p>
        </div>
      </div>
      <div className="ops-chart-grid">
        <section className="panel plan-chart">
          <div className="panel-heading">
            <h2>The 7-day pace</h2>
            <div className="chart-legend">
              <span>— Plan</span>
              <b>— Actual</b>
            </div>
          </div>
          <PaceChart daily={stats.daily} />
          <div className={"day-gate " + (stats.total >= 240 ? "met" : "")}>
            <span>
              {stats.total >= 240 ? <Check size={17} /> : <FlagIcon />}Day-4
              gate: 240 registrations
            </span>
            <strong>
              {stats.total >= 240
                ? "Reached"
                : Math.max(0, 240 - stats.total) + " to go"}
            </strong>
          </div>
          <small>
            Campaign starts {stats.config.campaignStart}. Seeds before this date
            do not appear in the actual campaign curve.
          </small>
        </section>
        <section className="panel funnel-panel">
          <h2>Where students drop off</h2>
          <div className="funnel">
            {funnel.map((f, i) => {
              const drop =
                i && funnel[i - 1].value
                  ? Math.max(
                      0,
                      Math.round((1 - f.value / funnel[i - 1].value) * 100),
                    )
                  : 0;
              return (
                <div key={f.name}>
                  <div>
                    <span>{f.name}</span>
                    <strong>{f.value}</strong>
                  </div>
                  <div className="funnel-track">
                    <span
                      style={{
                        width:
                          (f.value / Math.max(1, stats.funnel.views)) * 100 +
                          "%",
                      }}
                    />
                  </div>
                  {i > 0 && <small>{drop}% drop from previous step</small>}
                </div>
              );
            })}
          </div>
          <small>
            Views, starts and cards count distinct sessions. Seats count unique
            registrations. Funnel telemetry is directional and can be blocked by
            the browser.
          </small>
        </section>
      </div>
      <section className="brief-section">
        <div className="brief-intro">
          <div>
            <span className="brief-icon">
              <Sparkles size={23} />
            </span>
            <h2>Your morning brief.</h2>
            <p>
              Only aggregate numbers. Five actions you can copy.
              <br />
              No messages are sent automatically.
            </p>
          </div>
          <button className="primary-button" disabled={busy} onClick={getBrief}>
            {busy ? "Preparing your brief…" : "Generate Morning Brief"}
            <ArrowUpRight size={18} />
          </button>
        </div>
        {brief ? (
          <div className="brief-output">
            <div className="brief-source">
              {brief.source === "ai"
                ? "AI-generated · validated numbers"
                : "Deterministic analyst template · model not configured or fallback used"}{" "}
              · {stats.hideDemo ? "live records only" : "demo records included"}
            </div>
            <div className="brief-insights">
              {brief.insights.map((x, i) => (
                <p key={x}>
                  <b>0{i + 1}</b>
                  {x}
                </p>
              ))}
            </div>
            <div className="brief-actions">
              {brief.actions.map((a, i) => (
                <article key={i}>
                  <span className="micro">{a.owner}</span>
                  <h3>{a.action}</h3>
                  <p>{a.why}</p>
                  <blockquote>{a.message}</blockquote>
                  <button
                    className="text-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(a.message);
                        setCopied(i);
                      } catch {
                        setError(
                          "Copy is unavailable. Select the message text.",
                        );
                      }
                    }}
                  >
                    <Copy size={16} />
                    {copied === i ? "Copied" : "Copy message"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="brief-empty">
            <p>
              {stalled
                ? `${stalled.name} has ${stalled.views} views and ${stalled.total} registrations. Start with this campus signal.`
                : "No campus signals yet. Generate the brief for a starting plan."}
            </p>
          </div>
        )}
      </section>
      <div className="ops-table-grid">
        <section className="panel">
          <h2>Pitch angles</h2>
          <p className="muted">Tags arrive through shared links.</p>
          <div className="simple-table">
            {stats.angles.map((a) => (
              <div key={a.angle}>
                <span>
                  {(
                    {
                      R: "Resume gap",
                      P: "Placements",
                      F: "Friends",
                    } as Record<string, string>
                  )[a.angle] ?? a.angle}
                </span>
                <strong>{a.count}</strong>
              </div>
            ))}
            {!stats.angles.length && (
              <p className="empty">No registrations yet.</p>
            )}
          </div>
          <small>
            Compare angles after comparable reach; counts alone do not prove
            conversion.
          </small>
        </section>
        <section className="panel">
          <h2>Ambassadors</h2>
          <div className="simple-table ambassadors">
            {stats.ambassadors.slice(0, 8).map((a) => (
              <div key={a.code}>
                <span>
                  <strong>{a.college}</strong>
                  <small>{a.code}</small>
                </span>
                <b>
                  {a.referrals}
                  <small> referrals</small>
                </b>
              </div>
            ))}
            {!stats.ambassadors.length && (
              <p className="empty">No ambassadors marked in this view.</p>
            )}
          </div>
          <form
            className="ambassador-form"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api("ops/ambassador", { code: code.toUpperCase() });
                setCode("");
                await load();
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            <label htmlFor="amb-code">
              Mark an ambassador by their share code
            </label>
            <div>
              <input
                id="amb-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                minLength={6}
                required
                placeholder="6-letter code"
              />
              <button className="secondary-button">Add</button>
            </div>
          </form>
        </section>
      </div>
      <section className="panel stalled-table">
        <h2>Campus signals</h2>
        <div className="simple-table">
          {[...stats.colleges]
            .filter((c) => c.views > 0)
            .sort((a, b) => b.views - b.total - (a.views - a.total))
            .slice(0, 8)
            .map((c) => (
              <div key={c.id}>
                <a href={"/c/" + c.slug}>{c.name}</a>
                <span>{c.views} views</span>
                <span>{c.total} seats</span>
                <strong>
                  {c.views ? Math.round((c.total / c.views) * 100) : 0}%
                </strong>
              </div>
            ))}
          {!stats.funnel.views && (
            <p>No visits yet. Launch a small campus pilot.</p>
          )}
        </div>
      </section>
      <p className="ai-health">
        Project/brief requests: {stats.health.calls} · fallback:{" "}
        {stats.health.fallbacks} · average processing: {stats.health.avgLatency}
        ms. Cached Build Cards skip repeated calls.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function FlagIcon() {
  return <span aria-hidden="true">◌</span>;
}
function PaceChart({ daily }: { daily: number[] }) {
  let n = 0;
  const actual = daily.map((x) => (n += x)),
    max = Math.max(500, n),
    point = (v: number, i: number) => `${40 + i * 86},${215 - (v / max) * 185}`;
  return (
    <svg
      className="pace-svg"
      viewBox="0 0 600 255"
      role="img"
      aria-label={
        "Cumulative plan 40, 105, 175, 240, 310, 395, 500. Actual " +
        actual.join(", ")
      }
    >
      {[0, 250, 500].map((y) => (
        <g key={y}>
          <line
            x1="40"
            x2="556"
            y1={215 - (y / max) * 185}
            y2={215 - (y / max) * 185}
            stroke="var(--line)"
            strokeDasharray="4 5"
          />
          <text
            x="2"
            y={220 - (y / max) * 185}
            fill="var(--muted)"
            fontSize="12"
          >
            {y}
          </text>
        </g>
      ))}
      <polyline
        points={cumulativePlan().map(point).join(" ")}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <polyline
        points={actual.map(point).join(" ")}
        fill="none"
        stroke="var(--blue)"
        strokeWidth="3"
      />
      {actual.map((v, i) => (
        <g key={i}>
          <circle
            cx={40 + i * 86}
            cy={215 - (v / max) * 185}
            r="4"
            fill="var(--blue)"
          />
          <text
            x={40 + i * 86}
            y="245"
            fill="var(--muted)"
            fontSize="12"
            textAnchor="middle"
          >
            Day {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
