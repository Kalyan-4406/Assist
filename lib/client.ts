"use client";
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function sessionId() {
  let s = sessionStorage.getItem("cbr_session");
  if (!s) {
    s = crypto.randomUUID();
    sessionStorage.setItem("cbr_session", s);
  }
  return s;
}
export async function api<T = Record<string, unknown>>(
  path: string,
  data?: unknown,
): Promise<T> {
  const response = await fetch("/api/" + path, {
    method: data === undefined ? "GET" : "POST",
    headers:
      data === undefined ? undefined : { "content-type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store",
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new ApiError(result.error ?? "Please try again.", response.status);
  return result;
}
export function track(
  type: string,
  collegeId: string | null,
  ref: string | null = null,
) {
  void api("events", { type, collegeId, ref, session: sessionId() }).catch(
    () => {},
  );
}
export function shareLink(college: string, code: string, angle = "F") {
  return `${location.origin}/c/${college}?ref=${code}&angle=${angle}&v=${Math.floor(Date.now() / 3600000)}`;
}
export function whatsapp(message: string) {
  return "https://wa.me/?text=" + encodeURIComponent(message);
}
