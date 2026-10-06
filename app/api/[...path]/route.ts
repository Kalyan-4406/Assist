import { z } from "zod";
import { HttpError, rateLimit, sameOrigin, row, run } from "@/lib/server";
import { buildCard, aiBrief } from "@/lib/ai";
import { briefInput, fallbackBrief } from "@/lib/brief";
import {
  snapshot,
  addCollege,
  logEvent,
  register,
  saveReadiness,
  publicRegistration,
  setDemoHidden,
  exportRegistrations,
  publicConfig,
} from "@/lib/data";
import {
  ownerId,
  opsLogin,
  requireOps,
  sessionCookie,
  signSession,
} from "@/lib/auth";
import { calendarContent, csvCell } from "@/lib/domain";
export const dynamic = "force-dynamic";
const branchSchema = z.enum(["CSE/IT", "ECE/EEE", "Mech/Civil", "Other"]);
const inputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least two characters for your name.")
    .max(80),
  email: z.string().trim().email("Use a valid email address.").max(254),
  collegeId: z.string().min(1).max(100),
  branch: branchSchema,
  year: z.enum(["Final year", "Third year", "Other year"]),
  interest: z.string().trim().min(1).max(120),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Please consent to receiving workshop details.",
    }),
  }),
  ref: z.string().max(6).optional(),
  angle: z.enum(["R", "P", "F"]).optional(),
  session: z.string().min(6).max(80),
  website: z.string().max(0).optional(),
});
const headers = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};
const json = (
  data: unknown,
  status = 200,
  extra: Record<string, string> = {},
) => Response.json(data, { status, headers: { ...headers, ...extra } });
async function body(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 10000)
    throw new HttpError("That request is too large.", 413);
  const text = await request.text();
  if (text.length > 10000)
    throw new HttpError("That request is too large.", 413);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError("Send a valid request and try again.");
  }
}
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, { params }: Context) {
  try {
    const path = (await params).path.join("/");
    if (path === "snapshot") return json(await snapshot());
    if (path.startsWith("me/")) {
      const code = path.slice(3);
      if (!/^[A-Z0-9]{6}$/.test(code))
        throw new HttpError("That share code was not found.", 404);
      const r = await publicRegistration(code, await ownerId(request));
      if (!r) throw new HttpError("That share code was not found.", 404);
      return json(r);
    }
    if (path === "calendar") {
      const c = publicConfig(),
        calendar = calendarContent(c.dateISO, c.siteUrl);
      if (!calendar)
        throw new HttpError(
          "The workshop date has not been announced yet.",
          409,
        );
      return new Response(calendar, {
        headers: {
          ...headers,
          "content-type": "text/calendar; charset=utf-8",
          "content-disposition": 'attachment; filename="campus-build-race.ics"',
        },
      });
    }
    if (path === "ops/stats") {
      await requireOps(request);
      const include = new URL(request.url).searchParams.get("demo");
      return json(
        await snapshot(include === null ? undefined : include === "1"),
      );
    }
    if (path === "ops/export") {
      await requireOps(request);
      const s = await snapshot();
      const records = await exportRegistrations(!s.hideDemo);
      const columns = [
        "name",
        "email",
        "college_id",
        "branch",
        "year",
        "own_code",
        "ref_code",
        "angle",
        "is_demo",
        "readiness",
        "consent_at",
        "created_at",
      ];
      const csv =
        "\uFEFF" +
        [
          columns.map(csvCell).join(","),
          ...records.map((r) => columns.map((k) => csvCell(r[k])).join(",")),
        ].join("\r\n");
      return new Response(csv, {
        headers: {
          ...headers,
          "content-type": "text/csv; charset=utf-8",
          "content-disposition":
            'attachment; filename="campus-build-race-registrations.csv"',
        },
      });
    }
    throw new HttpError("That page was not found.", 404);
  } catch (error) {
    return handleError(error);
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    sameOrigin(request);
    const path = (await params).path.join("/");
    const input = await body(request);
    if (path === "build-card") {
      await rateLimit(request, "build-card", 80);
      const p = z
        .object({
          branch: branchSchema,
          interest: z.string().trim().min(1).max(120),
        })
        .parse(input);
      return json(await buildCard(p.branch, p.interest));
    }
    if (path === "register") {
      await rateLimit(request, "register", 15);
      const p = inputSchema.parse(input);
      const generated = await buildCard(p.branch, p.interest);
      const result = await register(p, generated.card, await ownerId(request));
      if (result.existing && !result.owned)
        return json({
          alreadyRegistered: true,
          owned: false,
          message:
            "You’re already in. For your private card and checklist, return to the browser where you registered. Workshop details will go to your consented email.",
        });
      const cookie = await signSession("owner", result.id!);
      const profile = await publicRegistration(result.code!, result.id);
      return json(
        { alreadyRegistered: result.existing, owned: true, profile },
        200,
        { "set-cookie": sessionCookie("cbr_owner", cookie, request) },
      );
    }
    if (path === "colleges") {
      await rateLimit(request, "add-college", 10);
      const p = z
        .object({
          name: z.string().trim().min(3).max(120),
          city: z.string().trim().min(2).max(60),
          state: z.string().trim().min(2).max(60),
        })
        .parse(input);
      return json(await addCollege(p.name, p.city, p.state));
    }
    if (path === "events") {
      await rateLimit(request, "events", 400);
      const p = z
        .object({
          type: z.enum([
            "view_college",
            "start_register",
            "step_2",
            "card_shown",
            "share_click",
            "calendar_click",
            "group_click",
          ]),
          collegeId: z.string().max(100).nullable(),
          ref: z.string().max(6).nullable().optional(),
          session: z.string().min(6).max(80),
        })
        .parse(input);
      if (
        p.collegeId &&
        !(await row("SELECT id FROM colleges WHERE id=?", p.collegeId))
      )
        throw new HttpError("College not found.", 404);
      await logEvent(p.type, p.collegeId, p.ref ?? null, p.session);
      return json({ ok: true });
    }
    if (path === "readiness") {
      await rateLimit(request, "readiness", 120);
      const p = z
        .object({
          code: z.string().regex(/^[A-Z0-9]{6}$/),
          readiness: z.object({
            laptop: z.boolean(),
            account: z.boolean(),
            repo: z.boolean(),
          }),
        })
        .parse(input);
      await saveReadiness(p.code, await ownerId(request), p.readiness);
      return json({ ok: true });
    }
    if (path === "ops/login") {
      const p = z.object({ password: z.string().min(1).max(150) }).parse(input);
      const token = await opsLogin(request, p.password);
      return json({ ok: true }, 200, {
        "set-cookie": sessionCookie("cbr_ops", token, request),
      });
    }
    if (path === "ops/logout")
      return json({ ok: true }, 200, {
        "set-cookie": "cbr_ops=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0",
      });
    if (path === "ops/demo") {
      await requireOps(request);
      const p = z.object({ hidden: z.boolean() }).parse(input);
      await setDemoHidden(p.hidden);
      return json(await snapshot());
    }
    if (path === "ops/ambassador") {
      await requireOps(request);
      const p = z
        .object({ code: z.string().regex(/^[A-Z0-9]{6}$/) })
        .parse(input);
      if (!(await row("SELECT id FROM registrations WHERE own_code=?", p.code)))
        throw new HttpError("That share code was not found.", 404);
      await run(
        "UPDATE registrations SET is_ambassador=1 WHERE own_code=?",
        p.code,
      );
      return json({ ok: true });
    }
    if (path === "ops/brief") {
      await requireOps(request);
      await rateLimit(request, "brief", 30);
      const s = await snapshot();
      return json(await aiBrief(briefInput(s), fallbackBrief(s)));
    }
    throw new HttpError("That action was not found.", 404);
  } catch (error) {
    return handleError(error);
  }
}
function handleError(error: unknown) {
  if (error instanceof z.ZodError)
    return json(
      {
        error: error.issues[0]?.message ?? "Check your details and try again.",
      },
      400,
    );
  if (error instanceof HttpError)
    return json({ error: error.message }, error.status);
  console.error(
    "Request failed:",
    error instanceof Error ? error.message : "unknown",
  );
  return json(
    {
      error:
        "We could not save that right now. Your details are kept on this device; please try again.",
    },
    503,
  );
}
