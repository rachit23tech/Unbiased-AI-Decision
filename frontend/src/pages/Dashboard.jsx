import { ArrowRight, Clock3, ShieldCheck, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import BiasScoreCard from "../components/BiasScoreCard";
import FlagBanner from "../components/FlagBanner";
import MetricChart from "../components/MetricChart";
import PageHeader from "../components/PageHeader";
import RiskTable from "../components/RiskTable";
import useAnalysisStore from "../store/useAnalysisStore";

const STATIC_QUEUE = [
  {
    name: "Loan Approval Scoring",
    time: "Review scheduled in 45 minutes",
    score: 46,
    risk: "high",
    note: "Disparate impact threshold breached across race cohorts.",
  },
  {
    name: "Hiring Model v3",
    time: "Submitted 2 hours ago",
    score: 78,
    risk: "medium",
    note: "Requires mitigation sign-off before next release train.",
  },
  {
    name: "Claims Triage v2",
    time: "Reviewed yesterday",
    score: 88,
    risk: "low",
    note: "Within tolerance band and ready for quarterly archiving.",
  },
];

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function scoreClass(score) {
  if (score < 50) return "queue-score-value score-low";
  if (score < 80) return "queue-score-value score-medium";
  return "queue-score-value score-high";
}

function riskClass(risk) {
  if (risk === "high") return "risk-pill risk-high";
  if (risk === "medium") return "risk-pill risk-medium";
  return "risk-pill risk-low";
}

export default function Dashboard() {
  const history = useAnalysisStore((s) => s.history);

  // ── KPI derivations ──────────────────────────────────
  const avgScore =
    history.length > 0
      ? Math.round(history.reduce((a, b) => a + b.overall, 0) / history.length)
      : 83;

  const needsReview =
    history.length > 0 ? history.filter((r) => r.overall < 70).length : 3;

  const passingCount =
    history.length > 0 ? history.filter((r) => r.overall >= 70).length : 0;

  const complianceRate =
    history.length > 0
      ? Math.round((passingCount / history.length) * 100)
      : 91;

  const posture =
    avgScore >= 70 ? "Stable" : avgScore >= 50 ? "At Risk" : "Critical";
  const postureTone =
    avgScore >= 70 ? "neutral" : avgScore >= 50 ? "warning" : "danger";

  const highRiskCount = history.filter((r) => r.overall < 50).length;

  // ── Review queue: worst 3 from history, fallback to static ──
  const liveQueue = [...history]
    .sort((a, b) => a.overall - b.overall)
    .slice(0, 3)
    .map((run) => ({
      name: `${run.fileName} — ${run.targetOutcome.replace(/_/g, " ")}`,
      time: timeAgo(run.runAt),
      score: run.overall,
      risk: run.overall < 50 ? "high" : run.overall < 70 ? "medium" : "low",
      note:
        run.overall < 50
          ? "Disparate impact threshold breached — escalation required."
          : run.overall < 70
            ? "Approaching threshold — requires mitigation sign-off."
            : "Within tolerance band — ready for quarterly archiving.",
    }));

  const reviewQueue = liveQueue.length > 0 ? liveQueue : STATIC_QUEUE;

  return (
    <div>
      <div className="executive-toolbar">
        <ShieldCheck size={18} color="#17324d" />
        <strong>Governance Summary</strong>
        <span>
          Executive portfolio view refreshed from the latest fairness and audit
          reviews.
        </span>
      </div>

      <PageHeader
        eyebrow="Portfolio Overview"
        title="Fairness Command Center"
        description="Monitor enterprise fairness posture, direct escalation decisions, and keep high-risk models moving through review with clear executive visibility."
        action={
          <Link to="/upload" className="btn btn-primary">
            Start New Review
            <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="summary-grid">
        <BiasScoreCard
          label="Fairness Posture"
          value={posture}
          tone={postureTone}
          trend={postureTone === "neutral" ? "up" : "down"}
          trendValue={
            postureTone === "neutral" ? "Board threshold met" : "Below target"
          }
          detail="Portfolio score measured against the operating benchmark for the current review cycle."
        />
        <BiasScoreCard
          label="Average Fairness Score"
          value={String(avgScore)}
          tone={
            avgScore >= 70 ? "success" : avgScore >= 50 ? "warning" : "danger"
          }
          trend="up"
          trendValue={
            history.length > 0
              ? `${history.length} model${history.length > 1 ? "s" : ""} analysed`
              : "+4.2%"
          }
          detail="Composite score across all monitored models in the current governance cycle."
        />
        <BiasScoreCard
          label="Models Needing Review"
          value={String(needsReview).padStart(2, "0")}
          tone={
            needsReview === 0 ? "success" : needsReview <= 3 ? "warning" : "danger"
          }
          trend="down"
          trendValue={
            needsReview === 0 ? "All clear" : `${needsReview} due this cycle`
          }
          detail="Escalated models concentrated in credit and hiring workflows that require sign-off."
        />
        <BiasScoreCard
          label="Compliance Rate"
          value={`${complianceRate}%`}
          tone={
            complianceRate >= 80
              ? "success"
              : complianceRate >= 60
                ? "warning"
                : "danger"
          }
          trend="up"
          trendValue={
            history.length > 0
              ? `${passingCount}/${history.length} passing`
              : "+1.8%"
          }
          detail="Most monitored systems operating within the current governance and fairness policy band."
        />
      </div>

      <FlagBanner
        title={
          highRiskCount > 0
            ? `Action Required: ${highRiskCount} model${highRiskCount > 1 ? "s" : ""} exceeded the bias threshold`
            : "Action Required: Medium-to-high risk reviews are stacking up"
        }
        message={
          highRiskCount > 0
            ? `${highRiskCount} recently analysed model${highRiskCount > 1 ? "s" : ""} breached the disparate impact threshold and must be reviewed before the next deployment window.`
            : "Two decisioning models crossed tolerance thresholds for disparate impact and should be reviewed before the next deployment window. The queue is still manageable, but leadership attention is required today."
        }
        severity={highRiskCount > 0 ? "high" : "medium"}
        meta={`Priority: ${needsReview} escalation${needsReview !== 1 ? "s" : ""}, ${history.length > 0 ? passingCount : 6} compliant model${passingCount !== 1 ? "s" : ""} awaiting routine archiving.`}
        action={
          <Link to="/reports" className="btn btn-secondary">
            Open Review Queue
          </Link>
        }
      />

      <div className="content-grid">
        <MetricChart />

        <section className="queue-panel">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Review Queue</h2>
              <p className="panel-description">
                Models currently moving through executive or governance review.
              </p>
            </div>
            <span className="panel-note">{reviewQueue.length} active items</span>
          </div>

          <div className="queue-list">
            {reviewQueue.map((item) => (
              <article key={item.name} className="queue-item">
                <div className="queue-item-main">
                  <span className={riskClass(item.risk)}>
                    {item.risk === "high" ? (
                      <ShieldX size={14} />
                    ) : (
                      <ShieldCheck size={14} />
                    )}
                    {item.risk === "high"
                      ? "High Risk"
                      : item.risk === "medium"
                        ? "Medium Risk"
                        : "Low Risk"}
                  </span>
                  <h3 className="queue-item-title">{item.name}</h3>
                  <p className="queue-item-meta">
                    <Clock3
                      size={14}
                      style={{ marginRight: 6, verticalAlign: "text-bottom" }}
                    />
                    {item.time}
                  </p>
                  <p className="queue-item-caption">{item.note}</p>
                </div>
                <div className="queue-score">
                  <p className={scoreClass(item.score)}>{item.score}</p>
                  <p className="queue-score-label">fairness score</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <RiskTable />
    </div>
  );
}
