import { ImageResponse } from "next/og";
import { collegeBySlug } from "@/lib/data";
import { imageFonts } from "@/lib/image-font";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { college: c, snapshot: s } = await collegeBySlug(slug);
  if (!c) return Response.json({ error: "College not found" }, { status: 404 });
  const rendered = new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "#ffffff",
        color: "#101828",
        padding: "48px 60px",
        fontFamily: "Space Grotesk",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <span style={{ display: "flex", color: "#2458eb" }}>
          ⚑ Campus Build Race
        </span>
        <span style={{ display: "flex", fontSize: 20, color: "#58667f" }}>
          {s.hideDemo ? "Live registrations" : "Demo data included"}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 42,
          fontSize: c.name.length > 35 ? 38 : 52,
          fontWeight: 700,
        }}
      >
        {c.name}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          marginTop: 14,
        }}
      >
        <span
          style={{
            display: "flex",
            fontSize: 152,
            color: "#2458eb",
            lineHeight: 1,
          }}
        >
          {c.total}
        </span>
        <span style={{ display: "flex", fontSize: 42, maxWidth: 620 }}>
          classmates registered to build
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 26,
          borderTop: "2px solid #e1e7f0",
        }}
      >
        <span style={{ display: "flex", fontSize: 29 }}>
          #{c.rank} in the Build Race
        </span>
        <span
          style={{
            display: "flex",
            background: "#2458eb",
            color: "white",
            borderRadius: 8,
            padding: "16px 25px",
            fontSize: 24,
          }}
        >
          Choose your first build →
        </span>
      </div>
      <span
        style={{
          display: "flex",
          fontSize: 18,
          color: "#58667f",
          marginTop: 20,
        }}
      >
        Free online AI workshop · {s.config.dateLabel}
      </span>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: await imageFonts(request),
      headers: {
        "cache-control": "public, max-age=0, must-revalidate",
        "x-content-type-options": "nosniff",
      },
    },
  );
  const bytes = await rendered.arrayBuffer();
  if (!bytes.byteLength) throw new Error('Share image renderer returned an empty PNG.');
  return new Response(bytes, {headers: rendered.headers});
}
