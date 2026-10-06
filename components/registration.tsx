"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  X,
  Check,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { Button } from "./action-button";
import { BuildCard } from "./build-card";
import { Confirmation } from "./confirmation";
import { api, ApiError, sessionId, track } from "@/lib/client";
import { templateCard, ideaIssue, shouldDiscardReferral } from "@/lib/domain";
import type {
  BuildCard as Card,
  College,
  Snapshot,
  PublicRegistration,
} from "@/lib/types";
type Draft = {
  step: number;
  branch: string;
  year: string;
  interest: string;
  name: string;
  email: string;
  consent: boolean;
  card: Card | null;
  source: string;
};
const empty: Draft = {
  step: 0,
  branch: "",
  year: "Final year",
  interest: "",
  name: "",
  email: "",
  consent: false,
  card: null,
  source: "template",
};
const topics = [
  "Placements",
  "Health",
  "Money",
  "Campus life",
  "Agriculture",
  "Gaming",
];
export function Registration({
  college,
  config,
}: {
  college: College;
  config: Snapshot["config"];
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    busyRef = useRef(false),
    [open, setOpen] = useState(false),
    [hydrated, setHydrated] = useState(false),
    [draft, setDraft] = useState<Draft>(empty),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [cardLoading, setCardLoading] = useState(false),
    [profile, setProfile] = useState<PublicRegistration | null>(null),
    [already, setAlready] = useState(false),
    [duplicateMessage, setDuplicateMessage] = useState(""),
    [pending, setPending] = useState(false),
    [custom, setCustom] = useState(""),
    [ref, setRef] = useState(""),
    [angle, setAngle] = useState<string | undefined>(),
    [refNote, setRefNote] = useState("");
  const storage = "cbr_draft_" + college.slug;
  useEffect(() => {
    setHydrated(true);
    try {
      const saved = sessionStorage.getItem(storage);
      let fresh = false;
      if (saved) {
        const parsed = JSON.parse(saved);
        fresh = Date.now() - parsed.at < 3600000;
        if (fresh)
          setDraft({ ...empty, ...parsed.draft });
        else sessionStorage.removeItem(storage);
      }
      setPending(fresh && sessionStorage.getItem(storage + "_pending") === "1");
      if (!fresh) sessionStorage.removeItem(storage + "_pending");
    } catch {}
    const q = new URLSearchParams(location.search),
      r = q.get("ref") ?? "";
    if (/^[A-Z0-9]{6}$/.test(r)) {
      setRef(r);
      api("me/" + r).catch((e) => {
        if (shouldDiscardReferral(e instanceof ApiError ? e.status : undefined)) {
          setRef("");
          setRefNote("That referral link is no longer valid. You can still register.");
        } else setRefNote("We’ll check your referral when you register. Your code is preserved.");
      });
    } else if (r)
      setRefNote(
        "That referral code could not be used. You can still register.",
      );
    const a = q.get("angle");
    if (a && ["R", "P", "F"].includes(a)) setAngle(a);
    const key = "cbr_view_" + college.slug;
    if (!sessionStorage.getItem(key)) {
      track("view_college", college.id, /^[A-Z0-9]{6}$/.test(r) ? r : null);
      sessionStorage.setItem(key, "1");
    }
  }, [college.id, college.slug, storage]);
  useEffect(() => {
    if (draft !== empty)
      sessionStorage.setItem(
        storage,
        JSON.stringify({ at: Date.now(), draft }),
      );
  }, [draft, storage]);
  useEffect(() => {
    if (open && !dialog.current?.open) {
      dialog.current?.showModal();
    } else if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  function start() {
    setOpen(true);
    track("start_register", college.id, ref || null);
  }
  async function choose(interest: string) {
    const issue = ideaIssue(interest);
    if (issue) { setError(issue); return; }
    setCardLoading(true);
    setError("");
    track("step_2", college.id, ref || null);
    patch({ interest });
    try {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const request = api<{ card: Card; source: string }>("build-card", {
        branch: draft.branch,
        interest,
      });
      const result = await Promise.race([request, new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Project service took too long")), 3600);
      })]).finally(() => clearTimeout(timeout));
      patch({ card: result.card, source: result.source, step: 2 });
      track("card_shown", college.id, ref || null);
    } catch (e) {
      const message = (e as Error).message;
      if (
        message.includes("contact details") ||
        message.includes("respectful") ||
        message.includes("diagnosis")
      )
        setError(message);
      else {
        patch({
          card: templateCard(interest, draft.branch),
          source: "template",
          step: 2,
        });
        setError(
          "The project service is offline. Your curated Build Card is ready; registration can still be retried.",
        );
        track("card_shown", college.id, ref || null);
      }
    } finally {
      setCardLoading(false);
    }
  }
  const submit = useCallback(async () => {
    if (!draft.consent) return;
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api<{
        alreadyRegistered: boolean;
        owned: boolean;
        profile?: PublicRegistration;
        message?: string;
      }>("register", {
        name: draft.name,
        email: draft.email,
        collegeId: college.id,
        branch: draft.branch,
        year: draft.year,
        interest: draft.interest,
        consent: draft.consent,
        ref: ref || undefined,
        angle,
        session: sessionId(),
        website:
          document.querySelector<HTMLInputElement>('[name="website"]')?.value ??
          "",
      });
      setPending(false);
      setOpen(true);
      sessionStorage.removeItem(storage + "_pending");
      if (result.profile) {
        setProfile(result.profile);
        setAlready(result.alreadyRegistered);
        sessionStorage.removeItem(storage);
        sessionStorage.setItem("cbr_my_code", result.profile.code);
      } else
        setDuplicateMessage(result.message ?? "You’re already registered.");
    } catch (e) {
      const message = (e as Error).message;
      if (!navigator.onLine || e instanceof TypeError) {
        setPending(true);
        sessionStorage.setItem(storage + "_pending", "1");
        setError(
          "You’re offline. Your details are saved on this device. We’ll retry when the connection returns; your seat is not confirmed yet.",
        );
      } else setError(message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [draft, college.id, ref, angle, storage]);
  const submitRef = useRef(submit);
  useEffect(() => { submitRef.current = submit; }, [submit]);
  useEffect(() => {
    if (!pending) return;
    const retry = () => {
      if (navigator.onLine) void submitRef.current();
    };
    window.addEventListener("online", retry);
    retry();
    return () => window.removeEventListener("online", retry);
  }, [pending]);
  const typo = draft.email.match(/@(gmial|gmal|gnail|gamil)\.com$/i);
  return (
    <>
      <div className="desktop-claim">
        <Button className="primary-button" disabled={!hydrated} onClick={start}>
          Claim my seat <ArrowRight size={18} />
        </Button>
      </div>
      {hydrated && createPortal(<div className="mobile-claim" style={open ? {display:"none"} : undefined}>
        <Button className="primary-button" disabled={!hydrated} onClick={start}>
          Claim my seat <ArrowRight size={18} />
        </Button>
      </div>, document.body)}
      <dialog
        ref={dialog}
        className={"registration-dialog " + (profile ? "is-confirmed" : "")}
        aria-labelledby="registration-title"
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setOpen(false);
        }}
      >
        <div className="dialog-inner">
          <button
            className="icon-button dialog-close"
            aria-label="Close registration"
            onClick={() => setOpen(false)}
          >
            <X size={21} />
          </button>
          {profile ? (
            <Confirmation profile={profile} config={config} already={already} />
          ) : duplicateMessage ? (
            <section className="duplicate">
              <ShieldCheck size={42} />
              <h2 id="registration-title">You’re already in.</h2>
              <p>{duplicateMessage}</p>
              <Button className="primary-button" onClick={() => setOpen(false)}>
                Back to your college
              </Button>
            </section>
          ) : (
            <>
              <div
                className="step-progress"
                aria-label={`Step ${draft.step + 1} of 3`}
              >
                {["Your branch", "Your first build", "Your seat"].map(
                  (label, i) => (
                    <span
                      key={label}
                      className={i <= draft.step ? "active" : ""}
                    >
                      <b>{i < draft.step ? <Check size={14} /> : i + 1}</b>
                      <small>{label}</small>
                    </span>
                  ),
                )}
              </div>
              {draft.step > 0 && (
                <button
                  className="text-button back-step"
                  onClick={() => {
                    patch({ step: draft.step - 1 });
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              {draft.step === 0 ? (
                <section className="step-section">
                  <h2 id="registration-title">Start with what you know.</h2>
                  <p>Choose your branch. Your project will start small.</p>
                  <div className="branch-options">
                    {["CSE/IT", "ECE/EEE", "Mech/Civil", "Other"].map((b) => (
                      <button
                        key={b}
                        className={
                          "choice " + (draft.branch === b ? "selected" : "")
                        }
                        onClick={() => patch({ branch: b, step: 1 })}
                      >
                        {b}
                        <ArrowUpRightIcon />
                      </button>
                    ))}
                  </div>
                  <label className="year-label">
                    Year
                    <select
                      value={draft.year}
                      onChange={(e) => patch({ year: e.target.value })}
                    >
                      <option>Final year</option>
                      <option>Third year</option>
                      <option>Other year</option>
                    </select>
                  </label>
                  <small>
                    Final-year students are the focus; everyone can explore a
                    build.
                  </small>
                </section>
              ) : draft.step === 1 ? (
                <section className="step-section">
                  <h2 id="registration-title">What do you care about?</h2>
                  <p>
                    Pick an interest. Get your Build Card before giving any
                    details.
                  </p>
                  {cardLoading ? (
                    <div className="card-skeleton" role="status">
                      <div />
                      <div />
                      <div />
                      <span>Preparing your first build…</span>
                    </div>
                  ) : (
                    <>
                      <div className="interest-options">
                        {topics.map((t) => (
                          <button
                            key={t}
                            className="choice"
                            onClick={() => choose(t)}
                          >
                            {t}
                            <ArrowUpRightIcon />
                          </button>
                        ))}
                      </div>
                      <label htmlFor="custom-idea">
                        Or describe your idea in one line
                      </label>
                      <div className="custom-idea">
                        <input
                          id="custom-idea"
                          value={custom}
                          maxLength={120}
                          onChange={(e) => setCustom(e.target.value)}
                          placeholder="A tool for my campus coding club"
                        />
                        <button
                          className="icon-button"
                          aria-label="Create card from my idea"
                          disabled={!custom.trim()}
                          onClick={() => choose(custom.trim())}
                        >
                          <ArrowRight size={20} />
                        </button>
                      </div>
                      <small>
                        {custom.length}/120 · please leave out personal
                        information.
                      </small>
                    </>
                  )}
                </section>
              ) : (
                <section className="step-section final-step">
                  <h2 id="registration-title">
                    Your build is ready. Make it yours.
                  </h2>
                  <div className="final-grid">
                    <BuildCard
                      card={
                        draft.card ?? templateCard(draft.interest, draft.branch)
                      }
                      source={draft.source}
                    />
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void submit();
                      }}
                    >
                      <p className="why-helps">{draft.card?.why_it_helps}</p>
                      <label htmlFor="student-name">Your name</label>
                      <input
                        id="student-name"
                        value={draft.name}
                        onChange={(e) => patch({ name: e.target.value })}
                        autoComplete="name"
                        required
                        minLength={2}
                        maxLength={80}
                        placeholder="Your first and last name"
                      />
                      <label htmlFor="student-email">Email address</label>
                      <input
                        id="student-email"
                        type="email"
                        inputMode="email"
                        value={draft.email}
                        onChange={(e) => patch({ email: e.target.value })}
                        autoComplete="email"
                        required
                        maxLength={254}
                        placeholder="you@example.com"
                      />
                      {typo && (
                        <button
                          type="button"
                          className="text-button typo-hint"
                          onClick={() =>
                            patch({
                              email: draft.email.replace(
                                /@[^@]+$/,
                                "@gmail.com",
                              ),
                            })
                          }
                        >
                          Did you mean @gmail.com? Tap to fix.
                        </button>
                      )}
                      <div className="honeypot" aria-hidden="true">
                        <label>
                          Website
                          <input
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                          />
                        </label>
                      </div>
                      <label className="consent">
                        <input
                          type="checkbox"
                          required
                          checked={draft.consent}
                          onChange={(e) => patch({ consent: e.target.checked })}
                        />
                        <span>Okay to email me workshop details</span>
                      </label>
                      <small className="privacy-note">
                        <ShieldCheck size={16} />
                        We use your email for workshop details. Your first name
                        and last initial appear on your campus page.{" "}
                        <a href="/privacy">Privacy</a>
                      </small>
                      <Button
                        className="primary-button"
                        type="submit"
                        disabled={busy}
                      >
                        {busy ? "Saving your seat…" : "Claim my seat"}
                        <ArrowRight size={18} />
                      </Button>
                      <small>Free · {config.dateLabel}</small>
                    </form>
                  </div>
                </section>
              )}
              {refNote && <p className="notice">{refNote}</p>}
              {error && (
                <p className="error" role="alert">
                  {pending && <WifiOff size={18} />} {error}
                </p>
              )}
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
function ArrowUpRightIcon() {
  return <span aria-hidden="true">↗</span>;
}
