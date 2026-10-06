import { cumulativePlan, labelDemoMessage } from "./domain";
import type { Snapshot, Brief } from "./types";
export function briefInput(s: Snapshot) {
  return {
    goal: 500,
    campaignDays: 7,
    day4: 4,
    day4Target: 240,
    day: s.config.day,
    plan: cumulativePlan(),
    total: s.total,
    daily: s.daily,
    funnel: s.funnel,
    referrals: s.referrals,
    ready: s.ready,
    colleges: s.colleges.map((c) => ({
      name: c.name,
      slug: c.slug,
      registrations: c.total,
      views: c.views,
      today: c.today,
    })),
    ambassadors: s.ambassadors,
    angles: s.angles,
    config: {
      dateLabel: s.config.dateLabel,
      siteUrl: s.config.siteUrl,
      demoIncluded: s.hasDemo && !s.hideDemo,
    },
  };
}
export function fallbackBrief(s: Snapshot): Brief {
  const target = cumulativePlan()[s.config.day - 1],
    gap = Math.max(0, target - s.total);
  const stalled =
    [...s.colleges]
      .filter((c) => c.views > 0)
      .sort((a, b) => b.views - b.total - (a.views - a.total))[0] ??
    s.colleges[0];
  const small =
    [...s.colleges]
      .filter((c) => c.total > 0)
      .sort((a, b) => a.total - b.total)[0] ?? s.colleges[0];
  const idle = s.ambassadors.filter((a) => a.referrals === 0).length;
  const link = s.config.siteUrl + (stalled ? "/c/" + stalled.slug : "/");
  const result: Brief = {
    source: "template",
    insights: [
      `${s.total} registrations against a day ${s.config.day} target of ${target}; ${gap} more reach today's plan.`,
      `${s.funnel.views} college-page sessions, ${s.funnel.started} starts and ${s.funnel.cards} Build Cards shown. Read each stage before changing the pitch.`,
      `${s.referrals} registrations carry a valid referral; ${s.ready} students have completed all readiness items. Registration and readiness measure different things.`,
    ],
    actions: [
      {
        owner: "Campus lead",
        action: stalled
          ? `Check the pitch at ${stalled.name}`
          : "Choose a pilot campus",
        why: stalled
          ? `${stalled.views} views and ${stalled.total} registrations.`
          : "There are no campus visits yet.",
        message: stalled
          ? `${stalled.name}: ${stalled.total} students are registered for the free AI build workshop. Pick a project before sharing your details. Date to be announced. ${link}`
          : `Find your college and choose your first AI project: ${link}`,
      },
      {
        owner: "Ambassador coordinator",
        action:
          "Check in with ambassadors who have no attributed registrations",
        why: `${idle} ambassadors have zero referrals in the selected data.`,
        message: `Your campus link is ready. Try one relevant class or coding-club group with permission. Ask what stops people from registering. ${s.config.siteUrl}/race`,
      },
      {
        owner: "Growth manager",
        action: gap
          ? "Recruit more active campus representatives"
          : "Keep the current campus rhythm",
        why: `${s.total} registrations; today's cumulative target is ${target}. The day-4 gate is 240.`,
        message: `We have ${s.total} registrations in the selected dataset. Please share your campus link with one relevant group and report what people ask. ${s.config.siteUrl}`,
      },
      {
        owner: "Community lead",
        action: small
          ? `Give ${small.name} a Rising-board nudge`
          : "Introduce the Rising board",
        why: small
          ? `${small.total} registrations at this campus; daily growth gives small campuses a visible goal.`
          : "A small campus can compete on additions.",
        message: `Your campus can climb by helping classmates build something useful. See the last-day additions on the Rising board: ${s.config.siteUrl}/race?tab=rising`,
      },
      {
        owner: "Workshop host",
        action: "Prepare a readiness reminder for consented registrants",
        why: `${s.ready} of ${s.total} have finished the three-item checklist. No message is sent by this app.`,
        message: `Before the AI build workshop, charge your laptop, create a free AI account and prepare an empty GitHub repository. Keep your own confirmation page handy. Workshop date is ${s.config.dateLabel.toLowerCase()}.`,
      },
    ],
  };
  result.insights = result.insights.map(m => labelDemoMessage(m, s.hasDemo && !s.hideDemo));
  result.actions = result.actions.map(a => ({...a, message: labelDemoMessage(a.message, s.hasDemo && !s.hideDemo)}));
  return result;
}
