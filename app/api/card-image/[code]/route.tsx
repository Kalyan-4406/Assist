import { ImageResponse } from "next/og";
import { publicRegistration } from "@/lib/data";
import { imageFonts } from "@/lib/image-font";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const p = await publicRegistration(code, null);
  if (!p)
    return Response.json({ error: "Build Card not found" }, { status: 404 });
  const portrait = new URL(request.url).searchParams.get("size") === "portrait";
  const rendered = new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#2458eb",
        color: "#fff",
        padding: portrait ? "76px" : "50px 62px",
        fontFamily: "Space Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingBottom: 26,
          borderBottom: "2px solid #83a5ff",
          fontSize: portrait ? 26 : 22,
        }}
      >
        <span style={{ display: "flex" }}>BUILD PASSPORT</span>
        <span style={{ display: "flex" }}>CAMPUS BUILD RACE</span>
      </div>
      <span
        style={{
          display: "flex",
          fontSize: portrait ? 28 : 23,
          marginTop: portrait ? 80 : 32,
        }}
      >
        {p.firstName}’s first AI build
      </span>
      <div
        style={{
          display: "flex",
          fontSize: portrait ? 91 : 61,
          lineHeight: 1.07,
          fontWeight: 700,
          marginTop: 26,
          maxWidth: 900,
        }}
      >
        {p.card.title}
      </div>
      <span
        style={{
          display: "flex",
          fontSize: portrait ? 37 : 29,
          lineHeight: 1.5,
          marginTop: 26,
          maxWidth: 900,
        }}
      >
        {p.card.one_liner}
      </span>
      <div style={{ display: "flex", gap: 16, marginTop: portrait ? 55 : 25 }}>
        {p.card.stack.map((t) => (
          <span
            key={t}
            style={{
              display: "flex",
              borderRadius: 40,
              background: "#e3eeff",
              color: "#113070",
              padding: "11px 24px",
              fontSize: portrait ? 26 : 20,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      {portrait && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 70,
            paddingTop: 32,
            borderTop: "2px solid #83a5ff",
          }}
        >
          <span style={{ display: "flex", fontSize: 23, letterSpacing: 3 }}>
            FIRST STEP
          </span>
          <span
            style={{
              display: "flex",
              fontSize: 35,
              marginTop: 20,
              lineHeight: 1.45,
            }}
          >
            {p.card.first_step}
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginTop: "auto",
          paddingTop: 24,
          borderTop: "2px solid #83a5ff",
        }}
      >
        <span style={{ display: "flex", fontSize: portrait ? 28 : 22 }}>
          Building it in 60 minutes · #{p.position} from {p.college.name}
        </span>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 22,
          }}
        >
          <span style={{ display: "flex", fontSize: portrait ? 24 : 18 }}>
            ONE HOUR. ONE PROJECT. YOURS.
          </span>
          <span style={{ display: "flex", fontSize: portrait ? 30 : 24 }}>
            {p.code}
          </span>
        </div>
        <span
          style={{
            display: "flex",
            fontSize: portrait ? 19 : 14,
            marginTop: 20,
            color: "#e3eeff",
          }}
        >
          Independent challenge simulation · share card
        </span>
      </div>
    </div>,
    {
      width: portrait ? 1080 : 1200,
      height: portrait ? 1350 : 630,
      fonts: await imageFonts(request),
      headers: {
        "cache-control": "public, max-age=0, must-revalidate",
        "content-disposition": `inline; filename="build-card-${p.code}.png"`,
        "x-content-type-options": "nosniff",
      },
    },
  );
  const bytes = await rendered.arrayBuffer();
  if (!bytes.byteLength) throw new Error('Share image renderer returned an empty PNG.');
  return new Response(bytes, {headers: rendered.headers});
}
