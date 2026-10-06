import { configValue, HttpError, rateLimit } from "./server";
const encoder = new TextEncoder();
async function signature(value: string) {
  const secret = configValue("SESSION_SECRET");
  if (secret.length < 32)
    throw new HttpError("Server security is not configured.", 503);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}
export async function signSession(role: string, id: string) {
  const value = btoa(
    JSON.stringify({
      role,
      id,
      exp: Date.now() + (role === "ops" ? 8 * 3600000 : 30 * 86400000),
    }),
  )
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return value + "." + (await signature(value));
}
export async function readSession(cookie: string | undefined, role: string) {
  if (!cookie) return null;
  const [value, sig] = cookie.split(".");
  if (!value || !sig) return null;
  const expected = await signature(value);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++)
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff) return null;
  try {
    const payload = JSON.parse(
      atob(value.replaceAll("-", "+").replaceAll("_", "/")),
    );
    return payload.role === role && payload.exp > Date.now()
      ? String(payload.id)
      : null;
  } catch {
    return null;
  }
}
export function cookieValue(request: Request, name: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + "="))
    ?.slice(name.length + 1);
}
export async function ownerId(request: Request) {
  return readSession(cookieValue(request, "cbr_owner"), "owner");
}
export async function requireOps(request: Request) {
  if (!(await readSession(cookieValue(request, "cbr_ops"), "ops")))
    throw new HttpError("Sign in to the growth desk first.", 401);
}
export function sessionCookie(name: string, value: string, request: Request) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${name === "cbr_ops" ? 28800 : 2592000}${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`;
}
export async function opsLogin(request: Request, password: string) {
  await rateLimit(request, "ops-login", 10);
  const expected = configValue("OPS_PASSWORD");
  if (!expected)
    throw new HttpError("Growth desk password is not configured.", 503);
  const a = await signature(password),
    b = await signature(expected);
  if (a !== b)
    throw new HttpError("That password did not match. Try again.", 401);
  return signSession("ops", "operator");
}
