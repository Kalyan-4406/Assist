"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Copy, Share2, ArrowLeft } from "lucide-react";
import { Confirmation } from "./confirmation";
import { BuildCard } from "./build-card";
import { shareLink, track, whatsapp } from "@/lib/client";
import { labelDemoMessage } from "@/lib/domain";
import type { PublicRegistration, Snapshot } from "@/lib/types";
export function PersonalPage({
  profile,
  config,
}: {
  profile: PublicRegistration;
  config: Snapshot["config"];
}) {
  const [lang, setLang] = useState<"English" | "Hinglish">("English"),
    [copied, setCopied] = useState("");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const base = hydrated ? location.origin : config.siteUrl;
  const links = (a: string) =>
    !hydrated
      ? `${base}/c/${profile.college.slug}?ref=${profile.code}&angle=${a}`
      : shareLink(profile.college.slug, profile.code, a);
  const rawMessages =
    lang === "English"
      ? [
          {
            angle: "R",
            title: "The resume gap",
            text: `One more tutorial won’t make a project yours. I’m building ${profile.card.title} in a free AI workshop. Choose your first build and join ${profile.college.total} from ${profile.college.name}. ${links("R")}`,
          },
          {
            angle: "P",
            title: "Placement practice",
            text: `Want an AI project you can explain in an interview? Pick your idea before sharing your details. ${profile.college.total} from ${profile.college.name} are registered for the free build workshop. ${links("P")}`,
          },
          {
            angle: "F",
            title: "Bring your friends",
            text: `Let’s build together. ${profile.college.total} from ${profile.college.name} are in the Campus Build Race. Get your own Build Card and join the free one-hour workshop. ${links("F")}`,
          },
        ]
      : [
          {
            angle: "R",
            title: "The resume gap",
            text: `Sirf tutorial nahi, apna AI project banao. Main ${profile.card.title} build karunga. Free workshop ke liye apna idea choose karo. ${profile.college.name} se ${profile.college.total} registrations hain. ${links("R")}`,
          },
          {
            angle: "P",
            title: "Placement practice",
            text: `Interview mein explain karne ke liye apna AI project chahiye? Pehle idea choose karo, phir register karo. ${profile.college.name} se ${profile.college.total} students registered hain. ${links("P")}`,
          },
          {
            angle: "F",
            title: "Bring your friends",
            text: `Saath mein build karte hain. ${profile.college.name} se ${profile.college.total} registrations hain. Apna Build Card lo aur free one-hour workshop join karo. ${links("F")}`,
          },
        ];
  const messages = rawMessages.map(m => ({...m, text: labelDemoMessage(m.text, profile.demoIncluded)}));
  return (
    <div className="container personal-page">
      <Link prefetch={false} className="back-link" href={"/c/" + profile.college.slug}>
        <ArrowLeft size={18} />
        Your campus
      </Link>
      {profile.owned ? (
        <Confirmation profile={profile} config={config} />
      ) : (
        <section className="public-card">
          <h1>A first build worth sharing.</h1>
          <p className="lead">
            {profile.college.name} · #{profile.college.rank} in the campus race
          </p>
          <BuildCard card={profile.card} code={profile.code} />
          <Link
            className="primary-button"
            href={"/c/" + profile.college.slug + "?ref=" + profile.code}
          >
            Choose your own build →
          </Link>
        </section>
      )}
      <section className="share-kit">
        <div className="panel-heading">
          <div>
            <h2>Your share kit</h2>
            <p>
              Three honest angles. Share only in relevant groups with
              permission.
            </p>
          </div>
          <div className="segmented">
            {(["English", "Hinglish"] as const).map((l) => (
              <button
                className={l === lang ? "active" : ""}
                key={l}
                onClick={() => setLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="share-messages">
          {messages.map((m) => (
            <article key={m.angle}>
              <span className="micro">ANGLE {m.angle}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
              <div>
                <button
                  className="secondary-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(m.text);
                      setCopied(m.angle);
                    } catch {
                      setCopied("Copy not available; select the message.");
                    }
                  }}
                >
                  <Copy size={17} />
                  {copied === m.angle ? "Copied" : "Copy"}
                </button>
                <a
                  className="secondary-button"
                  href={whatsapp(m.text)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() =>
                    track("share_click", profile.college.id, profile.code)
                  }
                >
                  <Share2 size={17} />
                  WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
        <small>
          Template-written messages with live counts. Sharing opens WhatsApp;
          nothing is auto-sent.
        </small>
      </section>
    </div>
  );
}
