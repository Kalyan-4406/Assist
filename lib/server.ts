import { env } from "cloudflare:workers";
export function db(): D1Database {
  if (!env.DB) throw new Error("Durable database is not configured.");
  return env.DB;
}
export function configValue(key: string, fallback = "") {
  return String(
    (env as unknown as Record<string, unknown>)[key] ??
      process.env[key] ??
      fallback,
  );
}
export async function rows<T>(sql: string, ...args: unknown[]): Promise<T[]> {
  const result = await db()
    .prepare(sql)
    .bind(...args)
    .all<T>();
  return result.results;
}
export async function batchRows<T extends readonly unknown[]>(
  queries: { [K in keyof T]: { sql: string; args?: unknown[] } },
): Promise<{ [K in keyof T]: T[K][] }> {
  const results = await db().batch(
    queries.map(({sql,args=[]}) => db().prepare(sql).bind(...args)),
  );
  return results.map(result => result.results) as { [K in keyof T]: T[K][] };
}
export async function row<T>(
  sql: string,
  ...args: unknown[]
): Promise<T | null> {
  return db()
    .prepare(sql)
    .bind(...args)
    .first<T>();
}
export async function run(sql: string, ...args: unknown[]) {
  return db()
    .prepare(sql)
    .bind(...args)
    .run();
}
export async function hash(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
export async function rateLimit(
  request: Request,
  feature: string,
  cap: number,
) {
  const salt = configValue("SESSION_SECRET");
  if (!salt) throw new HttpError("Server security is not configured.", 503);
  const ip = request.headers.get("cf-connecting-ip") ?? "local";
  const hour = Math.floor(Date.now() / 3600000),
    key = feature + ":" + (await hash(salt + ":" + ip)) + ":" + hour;
  const result = await row<{ count: number }>(
    "INSERT INTO rate_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
    key,
    (hour + 1) * 3600,
  );
  if ((result?.count ?? 0) > cap)
    throw new HttpError("Too many requests. Please try again in an hour.", 429);
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new HttpError("Please use this site to make the request.", 403);
}
