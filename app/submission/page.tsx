import { Download, ArrowUpRight } from "lucide-react";
export const metadata = { title: "Submission kit" };
export default function Submission() {
  return (
    <div className="container prose">
      <h1>The submission kit.</h1>
      <p className="lead">
        Working product, defensible plan and a record of what was actually
        built.
      </p>
      <div className="kit-list">
        {[
          {
            file: "Submission_Summary.md",
            title: "Submission overview",
            body: "The four requested assets, question 6 and evidence for the evaluation criteria.",
          },
          {
            file: "Growth_Plan.pdf",
            title: "Five-slide growth plan",
            body: "500 in seven days, channel math, budget, campaign gates and risks.",
          },
          {
            file: "AI_Learning_Notes.pdf",
            title: "AI + learning notes",
            body: "Three Ask → AI suggestion → Change examples, including the redesign.",
          },
          {
            file: "Question_6_Answer.pdf",
            title: "Question 6: what I rejected",
            body: "An answer draft based on your actual request to change the first UI.",
          },
          {
            file: "Campus_Build_Race_Demo.mp4",
            title: "Under-three-minute demo",
            body: "Synthetic narration over the actual hosted product; a recording script is also included.",
          },
          {
            file: "Video_Script.md",
            title: "Recording script",
            body: "Timed cues for recording in your own voice.",
          },
          {
            file: "Outreach_Kit.md",
            title: "Ambassador message kit",
            body: "Proposal-only messages, interview questions and test protocol.",
          },
          {
            file: "Final_Audit.md",
            title: "Requirements and verification audit",
            body: "Evidence, implemented features and external inputs still required.",
          },
          {
            file: "Production_Verification.md",
            title: "Production verification record",
            body: "Public browser checks, mobile performance and media verification.",
          },
          {
            file: "Submission_Checklist.md",
            title: "Submission checklist",
            body: "Prepared assets and the personal steps to complete before submission.",
          },
        ].map((x) => (
          <a href={x.file.endsWith(".mp4") ? "https://campus-build-race-nxtwave.vabjashwanthreddy.chatgpt.site/submission/" + x.file : "/submission/" + x.file} download={x.file.endsWith(".mp4") ? undefined : true} key={x.file}>
            <Download size={21} />
            <span>
              <strong>{x.title}</strong>
              <small>{x.body}</small>
            </span>
            <ArrowUpRight size={18} />
          </a>
        ))}
      </div>
      <h2>What this simulation proves</h2>
      <p>
        Real durable registration writes, counts and referral attribution;
        private readiness updates; server-rendered Open Graph images; protected
        operational metrics and CSV export. Fictional seeds are labelled. The
        model is optional and the no-key template fallback is explicit.
      </p>
      <h2>Applicant review still matters</h2>
      <p>
        No student interviews or real campaign outreach were conducted. The
        official submission form was not supplied. Review the notes, record in
        your own voice if required, and use the official form yourself. No
        quote, prior experience or submission confirmation has been invented.
      </p>
    </div>
  );
}
