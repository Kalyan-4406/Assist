import { batchRows, configValue, db, HttpError, row, rows, run } from "./server";
import { maskedName, slugify } from "./domain";
import { ensureSeed } from "./seed";
import type {
  College,
  Snapshot,
  Registration,
  PublicRegistration,
} from "./types";

export function publicConfig() {
  const start = configValue("CAMPAIGN_START", "2026-10-04");
  const day = Math.max(
    1,
    Math.min(
      7,
      Math.floor(
        (Date.now() - new Date(start + "T00:00:00+05:30").getTime()) / 86400000,
      ) + 1,
    ),
  );
  return {
    dateLabel: configValue("WORKSHOP_DATE_LABEL", "Date to be announced"),
    dateISO: configValue("WORKSHOP_DATE_ISO"),
    groupUrl: configValue("WORKSHOP_GROUP_URL"),
    siteUrl: configValue("PUBLIC_SITE_URL", "http://localhost:5173"),
    campaignStart: start,
    day,
    campusGoal: Number(configValue("CAMPUS_GOAL", "50")) || 50,
  };
}
export async function demoHidden() {
  await ensureSeed();
  return (await row<{ value: string }>(
    "SELECT value FROM settings WHERE key=?", "hide_demo",
  ))?.value === "1";
}
export async function snapshot(demoOverride?: boolean): Promise<Snapshot> {
  await ensureSeed();
  const setting = await row<{ value: string }>(
    "SELECT value FROM settings WHERE key=?",
    "hide_demo",
  );
  const hideDemo =
    demoOverride === undefined ? setting?.value === "1" : !demoOverride;
  const filter = hideDemo ? "WHERE is_demo=0" : "";
  const now = Date.now(),
    today = new Date(now + 19800000).toISOString().slice(0, 10);
  const since = new Date(now - 86400000).toISOString();
  const [campuses, registrants, eventRows, totals, healthRows, ambassadors] =
    await batchRows<[
      {
        id: string;
        slug: string;
        name: string;
        city: string;
        state: string;
        is_demo: number;
      },
      {
        name: string;
        college_id: string;
        branch: string;
        ref_code: string | null;
        angle: string | null;
        readiness: string;
        created_at: string;
      },
      { type: string; college_id: string; session_id: string },
      { is_demo: number; total: number },
      { calls: number; fallbacks: number; avgLatency: number },
      { own_code: string; college_id: string }
    ]>([
      {sql:"SELECT id,slug,name,city,state,is_demo FROM colleges ORDER BY name"},
      {sql:`SELECT name,college_id,branch,ref_code,angle,readiness,created_at FROM registrations ${filter} ORDER BY created_at DESC`},
      {sql:`SELECT type,college_id,session_id FROM events ${filter}`},
      {sql:"SELECT is_demo,count(*) AS total FROM registrations GROUP BY is_demo"},
      {sql:"SELECT count(*) AS calls,COALESCE(sum(fallback_used),0) AS fallbacks,COALESCE(round(avg(latency_ms)),0) AS avgLatency FROM llm_calls"},
      {sql:`SELECT own_code,college_id FROM registrations WHERE is_ambassador=1 ${hideDemo ? "AND is_demo=0" : ""}`},
    ]);
  const health=healthRows[0]??{calls:0,fallbacks:0,avgLatency:0};
  const colleges: College[] = campuses.map((c) => {
    const rs = registrants.filter((r) => r.college_id === c.id);
    const branches: Record<string, number> = {};
    rs.forEach((r) => (branches[r.branch] = (branches[r.branch] ?? 0) + 1));
    return {
      ...c,
      total: rs.length,
      today: rs.filter(
        (r) =>
          new Date(new Date(r.created_at).getTime() + 19800000)
            .toISOString()
            .slice(0, 10) === today,
      ).length,
      rising: rs.filter((r) => r.created_at >= since).length,
      rank: 0,
      views: new Set(
        eventRows
          .filter((e) => e.college_id === c.id && e.type === "view_college")
          .map((e) => e.session_id),
      ).size,
      branches,
      recent: rs.slice(0, 8).map((r) => maskedName(r.name)),
    };
  });
  colleges.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  colleges.forEach((c, i) => {
    c.rank = i + 1;
  });
  const unique = (type: string) =>
    new Set(eventRows.filter((e) => e.type === type).map((e) => e.session_id))
      .size;
  const angleCounts = new Map<string, number>();
  registrants.forEach((r) =>
    angleCounts.set(
      r.angle ?? "Direct / untagged",
      (angleCounts.get(r.angle ?? "Direct / untagged") ?? 0) + 1,
    ),
  );
  const start = new Date(
    publicConfig().campaignStart + "T00:00:00+05:30",
  ).getTime();
  return {
    colleges,
    total: registrants.length,
    demoTotal: totals.find((t) => t.is_demo === 1)?.total ?? 0,
    liveTotal: totals.find((t) => t.is_demo === 0)?.total ?? 0,
    hideDemo,
    hasDemo: totals.some((t) => t.is_demo === 1 && t.total > 0),
    referrals: registrants.filter((r) => r.ref_code).length,
    ready: registrants.filter((r) => {
      try {
        return Object.values(JSON.parse(r.readiness)).every(Boolean);
      } catch {
        return false;
      }
    }).length,
    funnel: {
      views: unique("view_college"),
      started: unique("start_register"),
      cards: unique("card_shown"),
      submitted: registrants.length,
    },
    daily: Array.from(
      { length: 7 },
      (_, i) =>
        registrants.filter((r) => {
          const t = new Date(r.created_at).getTime();
          return t >= start + i * 86400000 && t < start + (i + 1) * 86400000;
        }).length,
    ),
    angles: Array.from(angleCounts, ([angle, count]) => ({ angle, count })),
    ambassadors: ambassadors
      .map((a) => ({
        code: a.own_code,
        college:
          colleges.find((c) => c.id === a.college_id)?.name ??
          "Unknown college",
        referrals: registrants.filter((r) => r.ref_code === a.own_code).length,
      }))
      .sort((a, b) => b.referrals - a.referrals),
    health: health ?? { calls: 0, fallbacks: 0, avgLatency: 0 },
    config: publicConfig(),
  };
}
export async function collegeMetadata(slug: string) {
  await ensureSeed();
  return row<{ name: string; total: number }>(
    `SELECT c.name,count(r.id) AS total FROM colleges c
     LEFT JOIN registrations r ON r.college_id=c.id
       AND (r.is_demo=0 OR COALESCE((SELECT value FROM settings WHERE key='hide_demo'),'0')='0')
     WHERE c.slug=? GROUP BY c.id`,
    slug,
  );
}
export async function collegeBySlug(slug: string) {
  const s = await snapshot();
  return { college: s.colleges.find((c) => c.slug === slug), snapshot: s };
}
export async function publicRegistration(
  code: string,
  owner: string | null,
): Promise<PublicRegistration | null> {
  const r = await row<Registration>(
    "SELECT * FROM registrations WHERE own_code=?",
    code,
  );
  if (!r) return null;
  const s = await snapshot();
  const college = s.colleges.find((c) => c.id === r.college_id);
  if (!college) return null;
  const ref = await row<{ total: number }>(
    "SELECT count(*) AS total FROM registrations WHERE ref_code=?" +
      (s.hideDemo ? " AND is_demo=0" : ""),
    code,
  );
  const position = await row<{ total: number }>(
    "SELECT count(*) AS total FROM registrations WHERE college_id=? AND (created_at<? OR (created_at=? AND id<=?))" +
      (s.hideDemo ? " AND is_demo=0" : ""),
    r.college_id,
    r.created_at,
    r.created_at,
    r.id,
  );
  return {
    code,
    demoIncluded: s.hasDemo && !s.hideDemo,
    firstName: maskedName(r.name).split(" ")[0],
    college,
    card: JSON.parse(r.build_card),
    branch: r.branch,
    year: r.year,
    position: position?.total ?? 0,
    referrals: ref?.total ?? 0,
    readiness:
      owner === r.id
        ? JSON.parse(r.readiness)
        : { laptop: false, account: false, repo: false },
    owned: owner === r.id,
  };
}
export async function addCollege(name: string, city: string, state: string) {
  await ensureSeed();
  const slug = slugify(name);
  if (!slug)
    throw new HttpError(
      "Use at least one letter or number in the college name.",
    );
  await run(
    "INSERT OR IGNORE INTO colleges (id,slug,name,city,state,is_demo,created_at) VALUES (?,?,?,?,?,0,?)",
    slug,
    slug,
    name.trim().replace(/\s+/g, " "),
    city.trim(),
    state.trim(),
    new Date().toISOString(),
  );
  return await row<{ slug: string }>(
    "SELECT slug FROM colleges WHERE slug=?",
    slug,
  );
}
export async function setDemoHidden(hidden: boolean) {
  await run(
    "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    "hide_demo",
    hidden ? "1" : "0",
  );
}
export async function logEvent(
  type: string,
  collegeId: string | null,
  ref: string | null,
  session: string,
  isDemo = 0,
) {
  await run(
    "INSERT INTO events (id,type,college_id,ref_code,session_id,is_demo,created_at) VALUES (?,?,?,?,?,CASE WHEN ?=1 OR EXISTS(SELECT 1 FROM settings WHERE key=? AND value='1') THEN 1 ELSE 0 END,?)",
    crypto.randomUUID(),
    type,
    collegeId,
    ref,
    session,
    isDemo,
    "demo-session:" + session,
    new Date().toISOString(),
  );
}
export async function register(
  input: {
    name: string;
    email: string;
    collegeId: string;
    branch: string;
    year: string;
    interest: string;
    ref?: string;
    angle?: string;
    session: string;
  },
  card: unknown,
  owner: string | null,
) {
  await ensureSeed();
  const college = await row(
    "SELECT id FROM colleges WHERE id=?",
    input.collegeId,
  );
  if (!college)
    throw new HttpError("Choose a college before claiming your seat.");
  const email = input.email.toLowerCase().trim();
  const isDemo = email.endsWith(".invalid") ? 1 : 0;
  const existing = await row<Registration>(
    "SELECT * FROM registrations WHERE email=?",
    email,
  );
  if (existing)
    return {
      existing: true,
      owned: owner === existing.id,
      id: owner === existing.id ? existing.id : null,
      code: owner === existing.id ? existing.own_code : null,
    };
  const ref = input.ref
    ? await row<{ own_code: string; email: string }>(
        "SELECT own_code,email FROM registrations WHERE own_code=?",
        input.ref,
      )
    : null;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (const n of crypto.getRandomValues(new Uint8Array(6)))
    code += alphabet[n % alphabet.length];
  const id = crypto.randomUUID(),
    time = new Date().toISOString();
  try {
    await db().batch([
      db().prepare("INSERT INTO settings (key,value) SELECT ?,'1' WHERE ?=1 ON CONFLICT(key) DO NOTHING").bind("demo-session:" + input.session, isDemo),
      db().prepare("UPDATE events SET is_demo=1 WHERE session_id=? AND ?=1").bind(input.session, isDemo),
      db()
        .prepare(
          "INSERT INTO registrations (id,name,email,college_id,branch,year,idea_text,build_card,own_code,ref_code,angle,is_ambassador,is_demo,readiness,consent_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,?,?,?)",
        )
        .bind(
          id,
          input.name.trim(),
          email,
          input.collegeId,
          input.branch,
          input.year,
          input.interest,
          JSON.stringify(card),
          code,
          ref && ref.email !== email ? ref.own_code : null,
          input.angle ?? null,
          isDemo,
          '{"laptop":false,"account":false,"repo":false}',
          time,
          time,
        ),
      db()
        .prepare(
          "INSERT INTO events (id,type,college_id,ref_code,session_id,is_demo,created_at) VALUES (?,'submit',?,?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          input.collegeId,
          ref?.own_code ?? null,
          input.session,
          isDemo,
          time,
        ),
    ]);
  } catch (error) {
    const winner = await row<Registration>(
      "SELECT * FROM registrations WHERE email=?",
      email,
    );
    if (winner)
      return {
        existing: true,
        owned: owner === winner.id,
        id: owner === winner.id ? winner.id : null,
        code: owner === winner.id ? winner.own_code : null,
      };
    throw error;
  }
  return { existing: false, owned: true, id, code };
}
export async function saveReadiness(
  code: string,
  owner: string | null,
  readiness: unknown,
) {
  if (!owner)
    throw new HttpError(
      "Use the browser where you registered to save your checklist.",
      401,
    );
  const r = await row<Registration>(
    "SELECT id FROM registrations WHERE own_code=?",
    code,
  );
  if (!r || r.id !== owner)
    throw new HttpError("Only the owner can update this checklist.", 403);
  await run(
    "UPDATE registrations SET readiness=? WHERE id=?",
    JSON.stringify(readiness),
    owner,
  );
}
export async function exportRegistrations(includeDemo: boolean) {
  return rows<Record<string, unknown>>(
    `SELECT name,email,college_id,branch,year,own_code,ref_code,angle,is_demo,readiness,consent_at,created_at FROM registrations ${includeDemo ? "" : "WHERE is_demo=0"} ORDER BY created_at DESC`,
  );
}
