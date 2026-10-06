"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Check,
  Share2,
  Download,
  Calendar,
  Users,
  ArrowRight,
  Copy,
} from "lucide-react";
import type { PublicRegistration, Snapshot } from "@/lib/types";
import { BuildCard } from "./build-card";
import { api, shareLink, track, whatsapp } from "@/lib/client";
import { labelDemoMessage } from "@/lib/domain";
export function Confirmation({
  profile,
  config,
  already = false,
}: {
  profile: PublicRegistration;
  config: Snapshot["config"];
  already?: boolean;
}) {
  const [ready, setReady] = useState(profile.readiness),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const link = hydrated ? shareLink(profile.college.slug, profile.code)
    : `${config.siteUrl}/c/${profile.college.slug}?ref=${profile.code}&angle=F`;
  const message = labelDemoMessage(`I’m building my first AI project: ${profile.card.title}. ${profile.college.total} from ${profile.college.name} are registered. Pick your own project and join the free workshop. ${link}`, profile.demoIncluded);
  async function save(key: keyof typeof ready) {
    const next = { ...ready, [key]: !ready[key] };
    setSaving(true);
    setReady(next);
    setError("");
    try {
      await api("readiness", { code: profile.code, readiness: next });
      setReady(next);
    } catch (e) {
      setReady(ready);
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <section className="confirmation">
      <div className="success-mark">
        <Check size={30} />
      </div>
      <h1>
        {already
          ? "You’re already in."
          : "You’re in, " + profile.firstName + "."}
      </h1>
      <p className="lead">
        #{profile.position} from {profile.college.name}. Your first build starts
        here.
      </p>
      <div className="confirmation-grid">
        <BuildCard
          card={profile.card}
          firstName={profile.firstName}
          code={profile.code}
        />
        <div className="confirmation-actions">
          <h2>Bring your people along.</h2>
          <p>One friend is enough to start a build crew.</p>
          <a
            className="primary-button"
            href={whatsapp(message)}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              track("share_click", profile.college.id, profile.code)
            }
          >
            <Share2 size={19} />
            Share to WhatsApp
          </a>
          <button
            className="secondary-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              } catch {
                setError(
                  "Copy is unavailable in this browser. Select your referral link below.",
                );
              }
            }}
          >
            <Copy size={18} />
            {copied ? "Link copied" : "Copy your referral link"}
          </button>
          <input
            className="share-url"
            aria-label="Your referral link"
            readOnly
            value={link}
            onFocus={(e) => e.target.select()}
          />
          <a
            className="secondary-button"
            href={"/api/card-image/" + profile.code + "?size=portrait"}
            download
          >
            <Download size={18} />
            Download Build Card
          </a>
          {config.dateISO && (
            <div className="calendar-actions">
              <a
                className="secondary-button"
                href="/api/calendar"
                onClick={() => track("calendar_click", profile.college.id)}
              >
                <Calendar size={18} />
                Add calendar file
              </a>
              <a
                className="text-button"
                href={
                  "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
                  encodeURIComponent(
                    "Build Your First AI Project in 60 Minutes",
                  ) +
                  "&dates=" +
                  new Date(config.dateISO)
                    .toISOString()
                    .replace(/[-:]/g, "")
                    .replace(/\.\d+Z/, "Z") +
                  "/" +
                  new Date(new Date(config.dateISO).getTime() + 3600000)
                    .toISOString()
                    .replace(/[-:]/g, "")
                    .replace(/\.\d+Z/, "Z")
                }
                target="_blank"
                rel="noreferrer"
              >
                Google Calendar ↗
              </a>
            </div>
          )}
          {config.groupUrl && (
            <a
              className="secondary-button"
              href={config.groupUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("group_click", profile.college.id)}
            >
              <Users size={18} />
              Join the official workshop group
            </a>
          )}
          <small>
            Workshop: {config.dateLabel}. Your email consent is saved.
          </small>
          <div className="readiness">
            <h3>Your ready-to-build checklist</h3>
            {(
              [
                ["laptop", "Laptop charged and ready"],
                ["account", "Free AI account created"],
                ["repo", "Empty GitHub repo prepared"],
              ] as const
            ).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={ready[key]}
                  disabled={saving || !profile.owned}
                  onChange={() => save(key)}
                />
                <span>{label}</span>
              </label>
            ))}
            <small>
              {Object.values(ready).filter(Boolean).length}/3 complete · saved
              to your private session
            </small>
          </div>
          <div className="referral-summary">
            <strong>{profile.referrals}</strong>
            <span>friends registered through your link</span>
            <Link prefetch={false} href={"/me/" + profile.code}>
              Open your share kit <ArrowRight size={16} />
            </Link>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
      <Link prefetch={false} className="text-button" href="/race">
        See your campus in the race <ArrowRight size={18} />
      </Link>
    </section>
  );
}
