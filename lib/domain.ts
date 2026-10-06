import type { BuildCard } from "./types.ts";

export function labelDemoMessage(message: string, included: boolean) {
  return included ? "[Simulation: demo data included] " + message : message;
}
export function shouldDiscardReferral(status?: number) { return status === 404; }
export function reuseCardCache(cached: {source: string; created_at: string}, configured: boolean, now = Date.now()) {
  return cached.source === "ai" || !configured || now - Date.parse(cached.created_at) < 60000;
}

export function cumulativePlan() {
  let n = 0;
  return [8, 13, 14, 13, 14, 17, 21].map((p) => (n += p * 5));
}
export function forecast(p: {
  ambassadors: number;
  reach: number;
  joinRate: number;
  referralLift: number;
  direct: number;
}) {
  const campus = p.ambassadors * p.reach * p.joinRate;
  const referrals = campus * p.referralLift;
  return {
    campus,
    referrals,
    total: campus + referrals + p.direct,
    breakEven:
      (500 - p.direct) / (p.ambassadors * p.reach * (1 + p.referralLift)),
    perAmbassador: p.reach * p.joinRate * (1 + p.referralLift),
  };
}
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function maskedName(name: string) {
  const p = name.trim().split(/\s+/);
  return p[0] + (p.length > 1 ? " " + p.at(-1)!.charAt(0) + "." : "");
}
export function ideaIssue(text: string) {
  if (
    /[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(text) ||
    /(?:\+?\d[\s-]*){10,}/.test(text) ||
    /\b(password|aadhaar|credit card|private key)\b/i.test(text)
  )
    return "Please describe a project without contact details or private data.";
  if (
    /\b(diagnos\w*|chest pain|prescri\w*|stock tips|financial advice|investment advice)\b/i.test(
      text,
    )
  )
    return "Choose a learning project without medical diagnosis or financial advice.";
  if (/\b(fuck|shit|nigger|rape)\b/i.test(text))
    return "Please describe a respectful learning project.";
  return null;
}
const cards: Record<string, BuildCard> = {
  Placements: {
    title: "Placement practice partner",
    one_liner: "Turn a job description into a focused practice interview.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Paste a public job description into a simple form.",
    why_it_helps: "Practice explaining your skills before your next interview.",
  },
  Health: {
    title: "Habit check-in buddy",
    one_liner: "Turn your daily habit goals into a friendly check-in plan.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Add three everyday habits to a simple form.",
    why_it_helps: "Build a useful planner without collecting health records.",
  },
  Money: {
    title: "Budget category helper",
    one_liner:
      "Sort fictional expenses into categories and explain the pattern.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Create ten fictional expenses in a small text file.",
    why_it_helps: "Learn structured AI output using safe sample data.",
  },
  "Campus life": {
    title: "Campus FAQ companion",
    one_liner: "Answer common campus questions from a small public FAQ.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Write five campus questions with their verified answers.",
    why_it_helps: "Build a practical demo classmates can understand.",
  },
  Agriculture: {
    title: "Crop fact flashcards",
    one_liner: "Turn public crop information into simple study flashcards.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Collect five facts from a trusted public source.",
    why_it_helps: "Make technical information easier to revise and explain.",
  },
  Gaming: {
    title: "Game quest storyteller",
    one_liner: "Generate a short original quest from a character and setting.",
    stack: ["Gemini API", "JavaScript"],
    first_step: "Build a form for one character and one setting.",
    why_it_helps: "Learn prompting through a small playable creative idea.",
  },
};
export function templateCard(interest: string, _branch: string): BuildCard {
  return {
    ...(cards[interest] ?? cards.Placements),
    stack: [...(cards[interest] ?? cards.Placements).stack],
  };
}
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
export function validateCard(c: unknown): c is BuildCard {
  if (!c || typeof c !== "object") return false;
  const x = c as BuildCard;
  return (
    [
      ["title", 6],
      ["one_liner", 18],
      ["first_step", 12],
      ["why_it_helps", 14],
    ].every(
      ([k, n]) =>
        typeof x[k as keyof BuildCard] === "string" &&
        wordCount(x[k as keyof BuildCard] as string) > 0 &&
        wordCount(x[k as keyof BuildCard] as string) <= Number(n),
    ) &&
    Array.isArray(x.stack) &&
    x.stack.length > 0 &&
    x.stack.length <= 3 &&
    x.stack.every((s) => typeof s === "string" && s.length < 40) &&
    !ideaIssue(Object.values(x).join(" "))
  );
}
export function calendarContent(iso: string, url: string) {
  if (!iso || Number.isNaN(new Date(iso).getTime())) return null;
  const start = new Date(iso),
    end = new Date(start.getTime() + 3600000);
  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z/, "Z");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Build Race//EN",
    "BEGIN:VEVENT",
    "UID:campus-build-race-workshop@campusbuildrace",
    "DTSTAMP:" + fmt(new Date()),
    "DTSTART:" + fmt(start),
    "DTEND:" + fmt(end),
    "SUMMARY:Build Your First AI Project in 60 Minutes",
    "DESCRIPTION:Free online workshop. Workshop joining details will be emailed.",
    "URL:" + url,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
