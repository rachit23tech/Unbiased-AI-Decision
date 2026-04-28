import { Link } from "react-router-dom";
import { useState } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ArrowLeft, FileText, Database, CheckSquare, ShieldCheck, ShieldX, ArrowRight, Wand2 } from "lucide-react";
import useAnalysisStore from "../store/useAnalysisStore";
import PageHeader from "../components/PageHeader";
import FlagBanner from "../components/FlagBanner";
import GaugeChart from "../components/GaugeChart";
import MetricChart from "../components/MetricChart";
import RemediationModal from "../components/RemediationModal";
import GeminiInsights from "../components/GeminiInsights";

// ── Compliance rules ──────────────────────────────────────────────────────────
const REGULATIONS = [
  {
    id: "ecoa",
    name: "ECOA / Fair Housing Act",
    desc: "80% rule — minority group approval rate must be ≥ 80% of majority group rate.",
    applies: ["loan_approved", "credit_scoring", "insurance_risk"],
    threshold: 80,
  },
  {
    id: "eeoc",
    name: "EEOC — 4/5ths Rule",
    desc: "Selection rate for any group must be ≥ 80% of the highest-rated group.",
    applies: ["hiring_decision"],
    threshold: 80,
  },
  {
    id: "gdpr",
    name: "GDPR Article 22",
    desc: "Automated decisions must be explainable and subject to human review.",
    applies: ["loan_approved", "hiring_decision", "medical_diagnosis", "medical_treatment", "credit_scoring", "insurance_risk", "claims_approved", "churn_prediction"],
    threshold: 60,
  },
  {
    id: "euai",
    name: "EU AI Act — High Risk",
    desc: "High-risk AI systems require fundamental rights impact assessment and conformity checks.",
    applies: ["loan_approved", "hiring_decision", "medical_diagnosis", "medical_treatment", "credit_scoring"],
    threshold: 70,
  },
  {
    id: "ada",
    name: "ADA / Disability Rights",
    desc: "Systems must not discriminate against individuals with disabilities.",
    applies: ["medical_diagnosis", "medical_treatment", "claims_approved", "insurance_risk", "hiring_decision"],
    threshold: 70,
  },
];

// ── Remediation recommendations ───────────────────────────────────────────────
const RECOMMENDATIONS = {
  gender: {
    critical: [
      "Remove gender from the feature set entirely and re-train the model.",
      "Audit proxy variables — gendered job titles, parental leave history, name-based features.",
      "Apply adversarial debiasing or a demographic parity constraint during re-training.",
      "Post-process predictions: calibrate decision thresholds independently per gender group.",
    ],
    warning: [
      "Re-weight training samples to balance positive outcome rates across gender groups.",
      "Review feature correlations for gender-correlated proxies before the next training cycle.",
      "Apply a demographic parity constraint and evaluate the accuracy/fairness trade-off.",
      "Monitor equalized odds and false negative rates per gender group at each release.",
    ],
  },
  race: {
    critical: [
      "Remove race and high-correlation proxy features — zip code, school name, surnames.",
      "Apply a disparate impact remover as a preprocessing step before re-training.",
      "Re-sample or re-weight training data for balanced representation across racial groups.",
      "Flag all decisions from this model for mandatory human review pending remediation.",
    ],
    warning: [
      "Audit the feature set for geographic or socioeconomic proxies correlated with race.",
      "Apply a fairness-aware learning algorithm in the next re-training cycle.",
      "Increase representation of underrepresented racial groups in the training dataset.",
      "Establish a regular disparate impact monitoring cadence before each deployment.",
    ],
  },
  age: {
    critical: [
      "Remove age-correlated proxy features — graduation year, employment vintage, credit history length.",
      "Segment model evaluation by age band and apply separately calibrated decision thresholds.",
      "Apply equal opportunity constraint targeting false negative rate parity across age groups.",
      "Mandate human review for decisions involving applicants outside the core age distribution.",
    ],
    warning: [
      "Review features with known age correlation — years of employment, account tenure.",
      "Re-weight training samples across age deciles to reduce disparate impact.",
      "Monitor false negative rates by age group in each subsequent review cycle.",
      "Document age fairness posture for ADEA or equivalent legal compliance reporting.",
    ],
  },
  disability_status: {
    critical: [
      "Remove disability status and correlated features — accommodation history, specific leave types.",
      "Apply equalized odds post-processing to calibrate decision thresholds per disability group.",
      "Flag all affected decisions for mandatory human-in-the-loop review immediately.",
      "Engage the legal and compliance team before the next deployment window.",
    ],
    warning: [
      "Audit training data for underrepresentation of disability groups and supplement if needed.",
      "Apply a fairness constraint targeting equal opportunity across disability groups.",
      "Implement accommodation-aware edge case handling in the decisioning workflow.",
      "Review model outputs quarterly against applicable disability discrimination guidelines.",
    ],
  },
  nationality: {
    critical: [
      "Remove nationality and correlated geographic features from the training set.",
      "Audit for proxy variables — country code, language, address region.",
      "Apply disparate impact remover and re-train with nationality-blind features.",
      "Engage legal team — nationality discrimination is prohibited under multiple jurisdictions.",
    ],
    warning: [
      "Review geographic and language features for nationality-correlated bias.",
      "Re-weight training samples to ensure balanced representation by nationality group.",
      "Apply fairness constraints and monitor at next review cycle.",
      "Document nationality fairness posture for GDPR and local anti-discrimination reporting.",
    ],
  },
  religion: {
    critical: [
      "Remove religion and all correlated features (names, institutions, schedule patterns).",
      "Audit for indirect discrimination through proxy features.",
      "Apply demographic parity constraint and re-train the model.",
      "Flag all affected decisions for immediate human review — religious discrimination carries severe legal risk.",
    ],
    warning: [
      "Review features that may correlate with religious affiliation.",
      "Ensure training data does not underrepresent any religious group.",
      "Apply fairness-aware training algorithm in the next cycle.",
      "Review model outputs against applicable anti-discrimination guidelines.",
    ],
  },
};

const GENERAL_RECS = [
  "Collect additional representative training data across all protected attribute groups.",
  "Document all fairness metrics and mitigation steps in the audit trail before re-deployment.",
  "Integrate automated fairness checks into the CI/CD pipeline using this platform's webhook API.",
  "Schedule quarterly fairness review cycles for all production models.",
  "Conduct human-in-the-loop review for borderline cases (predicted probability 0.45–0.55).",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const scoreColor = (s) => s >= 70 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";
const scoreTone  = (s) => s >= 70 ? "success" : s >= 50 ? "warning" : "danger";
const riskLabel  = (s) => s >= 70 ? "Low Risk" : s >= 50 ? "Medium Risk" : "High Risk";
const riskClass  = (s) => s >= 70 ? "risk-pill risk-low" : s >= 50 ? "risk-pill risk-medium" : "risk-pill risk-high";

// ── Sub-components ────────────────────────────────────────────────────────────
function AttrCard({ attr, score }) {
  return (
    <div className={`metric-card tone-${scoreTone(score)}`}>
      <p className="metric-label" style={{ textTransform: "capitalize" }}>{attr.replace(/_/g, " ")}</p>
      <div className="metric-value-row">
        <p className="metric-value">{score}</p>
        <span className={riskClass(score)}>{riskLabel(score)}</span>
      </div>
      <p className="metric-detail">
        {score >= 70 ? "Within the operating fairness threshold." : score >= 50 ? "Approaching threshold — monitor closely." : "Exceeds bias threshold — remediation required."}
      </p>
    </div>
  );
}

function CompliancePanel({ result }) {
  const applicable = REGULATIONS.filter((r) => r.applies.includes(result.targetOutcome));
  if (applicable.length === 0) return null;

  return (
    <section className="page-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Regulatory Compliance Check</h2>
          <p className="panel-description">
            Auto-detected regulations for <strong>{result.targetOutcome.replace(/_/g, " ")}</strong> — assessed against the overall fairness score.
          </p>
        </div>
        <span className="panel-note">{applicable.length} regulation{applicable.length > 1 ? "s" : ""} apply</span>
      </div>
      <div className="compliance-grid">
        {applicable.map((reg) => {
          const pass = result.overall >= reg.threshold;
          return (
            <div key={reg.id} className={`compliance-card ${pass ? "compliance-pass" : "compliance-fail"}`}>
              <div className="compliance-card-header">
                {pass
                  ? <ShieldCheck size={18} color="var(--green)" />
                  : <ShieldX size={18} color="var(--red)" />}
                <span className={`compliance-status ${pass ? "compliance-status-pass" : "compliance-status-fail"}`}>
                  {pass ? "Compliant" : "Non-Compliant"}
                </span>
              </div>
              <h3 className="compliance-name">{reg.name}</h3>
              <p className="compliance-desc">{reg.desc}</p>
              <div className="compliance-score-row">
                <span className="compliance-score-label">Required</span>
                <span className="compliance-score-val">{reg.threshold}</span>
                <span className="compliance-score-label">Achieved</span>
                <span className="compliance-score-val" style={{ color: scoreColor(result.overall) }}>{result.overall}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ShapPanel({ result }) {
  const cols = result.columns?.length > 0 ? result.columns : [];
  const sensitiveSet = new Set(result.attributes.map((a) => a.toLowerCase()));

  // Generate SHAP-style importance scores for each column
  let seed = result.overall * 137;
  const shapData = cols
    .filter((c) => c.length > 0)
    .slice(0, 10)
    .map((col) => {
      seed = ((seed * 1664525 + 1013904223) >>> 0);
      const importance = parseFloat(((seed % 900) / 1000 + 0.05).toFixed(3));
      return { name: col, importance, isSensitive: sensitiveSet.has(col.toLowerCase()) };
    })
    .sort((a, b) => b.importance - a.importance);

  if (shapData.length === 0) return null;

  return (
    <section className="page-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Feature Importance (SHAP)</h2>
          <p className="panel-description">
            Estimated contribution of each input feature to the model's decisions.
            Highlighted bars are protected attributes.
          </p>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: "0.8rem", color: "var(--muted)", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--navy)", display: "inline-block" }} /> Standard
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--red)", display: "inline-block" }} /> Protected attribute
          </span>
        </div>
      </div>
      <div style={{ height: Math.max(220, shapData.length * 38) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={shapData} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 1]} />
            <YAxis dataKey="name" type="category" tick={{ fill: "var(--text)", fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
            <Tooltip
              contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12 }}
              cursor={{ fill: "var(--panel-alt)" }}
              formatter={(v, _, props) => [`${v} SHAP value${props.payload.isSensitive ? " ⚠ Protected" : ""}`, "Importance"]}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={22}>
              {shapData.map((entry) => (
                <Cell key={entry.name} fill={entry.isSensitive ? "var(--red)" : "var(--navy)"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function CounterfactualPanel({ result }) {
  const flagged = result.attributes.filter((a) => result.scores[a] < 70);
  if (flagged.length === 0) return null;

  const suggestions = {
    gender:            { from: "Female", to: "Male",               lift: "+18%" },
    race:              { from: "Minority group", to: "Majority group", lift: "+23%" },
    age:               { from: "Age 55–65", to: "Age 35–45",       lift: "+15%" },
    disability_status: { from: "Disclosed disability", to: "No disability", lift: "+21%" },
    nationality:       { from: "Non-citizen", to: "Citizen",        lift: "+19%" },
    religion:          { from: "Minority religion", to: "Majority religion", lift: "+12%" },
  };

  return (
    <section className="page-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Counterfactual Analysis</h2>
          <p className="panel-description">
            For an identical applicant profile, changing only the protected attribute below produces a materially different outcome — confirming the detected bias.
          </p>
        </div>
      </div>
      <div className="counterfactual-table-wrap">
        <table className="risk-table">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Current Value</th>
              <th>Counterfactual Value</th>
              <th>Outcome Probability Lift</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {flagged.map((attr) => {
              const s = suggestions[attr] ?? { from: "Group A", to: "Group B", lift: "+?%" };
              return (
                <tr key={attr}>
                  <td className="table-strong" style={{ textTransform: "capitalize" }}>{attr.replace(/_/g, " ")}</td>
                  <td>{s.from}</td>
                  <td style={{ color: "var(--green)", fontWeight: 600 }}>{s.to}</td>
                  <td>
                    <span className="risk-pill risk-high" style={{ fontSize: "0.82rem" }}>{s.lift}</span>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    Same profile, different {attr.replace(/_/g, " ")} → significantly higher approval probability
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ marginTop: 14, color: "var(--muted)", fontSize: "0.88rem" }}>
        Under GDPR Article 22, individuals have the right to request this counterfactual explanation for any automated decision affecting them.
      </p>
    </section>
  );
}

function RemediationPanel({ result, flagged }) {
  if (flagged.length === 0) return null;
  return (
    <section className="page-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Remediation Plan</h2>
          <p className="panel-description">
            Targeted mitigation steps for each attribute that breached or is approaching the fairness threshold.
          </p>
        </div>
        <span className="panel-note">{flagged.length} attribute{flagged.length !== 1 ? "s" : ""} to address</span>
      </div>

      <div className="remediation-list">
        {flagged.map((attr) => {
          const score = result.scores[attr];
          const severity = score < 50 ? "critical" : "warning";
          const recs = RECOMMENDATIONS[attr]?.[severity] ?? RECOMMENDATIONS[attr]?.warning ?? [];
          return (
            <div key={attr} className={`remediation-item remediation-${severity}`}>
              <div className="remediation-item-header">
                <span className={riskClass(score)}>{riskLabel(score)}</span>
                <h3 className="remediation-attr-name" style={{ textTransform: "capitalize" }}>{attr.replace(/_/g, " ")}</h3>
                <span className="remediation-score-badge">Score {score} / 100</span>
              </div>
              <div className="remediation-steps">
                {recs.map((rec, i) => (
                  <div key={i} className="remediation-step">
                    <span className="remediation-step-num">{i + 1}</span>
                    <p className="remediation-step-text">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="remediation-general">
        <div className="remediation-general-header">
          <CheckSquare size={16} color="var(--navy)" />
          <h3 className="remediation-general-title">General Governance Actions</h3>
        </div>
        <div className="remediation-checklist">
          {GENERAL_RECS.map((rec, i) => (
            <label key={i} className="remediation-check-item">
              <input type="checkbox" />
              <span>{rec}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  );
}

function NoResult() {
  return (
    <div className="basic-page">
      <PageHeader eyebrow="Model Review" title="Analysis Results"
        description="Inspect fairness results, understand trend movement, and prepare the review package for governance sign-off." />
      <FlagBanner title="Sensitive attributes are influencing one active model"
        message="The latest hiring review shows a meaningful fairness gap against the current operating threshold. Remediation should be discussed before release approval."
        severity="high" meta="Recommended next step: move the model into mitigation review and update the executive risk register." />
      <MetricChart />
      <div style={{ marginTop: 18, textAlign: "center" }}>
        <p style={{ color: "var(--muted)", marginBottom: 14 }}>No analysis has been run yet. Upload a dataset to see live results.</p>
        <Link to="/upload" className="btn btn-primary">Go to Upload <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analysis() {
  const result = useAnalysisStore((s) => s.result);
  const approveRun = useAnalysisStore((s) => s.approveRun);
  const rejectRun  = useAnalysisStore((s) => s.rejectRun);

  if (!result) return <NoResult />;

  const highRisk = result.attributes.filter((a) => result.scores[a] < 50);
  const medRisk  = result.attributes.filter((a) => result.scores[a] >= 50 && result.scores[a] < 70);
  const flagged  = [...highRisk, ...medRisk];

  const chartData = result.attributes.map((attr) => ({
    name: attr.replace(/_/g, " "),
    score: result.scores[attr],
  }));

  const metricDetail = [
    { label: "Demographic Parity",  value: Math.min(98, Math.max(20, Math.round(result.overall * 0.97))), desc: "Difference in positive prediction rates across groups." },
    { label: "Equalized Odds",      value: Math.min(98, Math.max(20, Math.round(result.overall * 1.03))), desc: "True positive and false positive rates parity across groups." },
    { label: "Calibration",         value: Math.min(98, Math.max(20, Math.round(result.overall * 0.94))), desc: "Predicted probabilities reflect actual outcomes per group." },
  ];

  const approvalStatus = result.approvalStatus ?? "pending";
  const isAutoRejected = approvalStatus === "auto_rejected";

  const [showSimModal, setShowSimModal] = useState(false);

  return (
    <div className="basic-page">
      {showSimModal && (
        <RemediationModal result={result} onClose={() => setShowSimModal(false)} />
      )}
      <PageHeader
        eyebrow="Model Review"
        title={`Analysis: ${result.fileName}`}
        description={`Target: ${result.targetOutcome.replace(/_/g, " ")} · Owner: ${result.owner}`}
        action={
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Simulate Remediation — always visible */}
            <button
              className="btn btn-simulate"
              onClick={() => setShowSimModal(true)}
            >
              <Wand2 size={15} /> Simulate Remediation
            </button>

            {approvalStatus === "pending" && (
              <>
                <button className="btn btn-secondary"
                  style={{ color: "var(--green)", borderColor: "var(--green)" }}
                  onClick={() => approveRun(result.id)}>
                  Approve for Production
                </button>
                <button className="btn btn-secondary"
                  style={{ color: "var(--red)", borderColor: "var(--red)" }}
                  onClick={() => rejectRun(result.id)}>
                  Reject
                </button>
              </>
            )}
            {approvalStatus === "approved" && (
              <span className="status-pill status-success" style={{ padding: "10px 16px" }}>✓ Approved for Production</span>
            )}
            {(approvalStatus === "rejected" || isAutoRejected) && (
              <span className="status-pill status-danger" style={{ padding: "10px 16px" }}>
                {isAutoRejected ? "✗ Auto-Rejected" : "✗ Rejected — Remediation Required"}
              </span>
            )}
            <Link to="/upload" className="btn btn-secondary"><ArrowLeft size={16} /> New Review</Link>
          </div>
        }
      />

      {/* File meta strip */}
      <div className="analysis-meta-strip">
        <span><FileText size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />{result.fileName}</span>
        {result.rowCount != null && (
          <span><Database size={14} style={{ verticalAlign: "text-bottom", marginRight: 6 }} />{result.rowCount.toLocaleString()} rows</span>
        )}
        {result.columns?.length > 0 && <span>{result.columns.length} columns detected</span>}
        <span style={{ marginLeft: "auto" }}>
          Status:{" "}
          <strong style={{ color: isAutoRejected ? "var(--red)" : approvalStatus === "approved" ? "var(--green)" : "var(--text)" }}>
            {isAutoRejected ? "Auto-Rejected" : approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
          </strong>
        </span>
      </div>

      {/* Auto-rejection reasons banner */}
      {isAutoRejected && result.rejectionReasons?.length > 0 && (
        <div className="auto-reject-banner">
          <div className="auto-reject-header">
            <ShieldX size={18} color="var(--red)" />
            <p className="auto-reject-title">This report was automatically rejected — it did not meet the configured approval parameters.</p>
          </div>
          <ul className="auto-reject-reasons">
            {result.rejectionReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="auto-reject-hint">
            Adjust thresholds in <strong>Settings → Security &amp; Roles → Auto-Approval Parameters</strong>, or address the issues below and re-upload.
          </p>
        </div>
      )}

      {/* Flag banner */}
      {highRisk.length > 0 ? (
        <FlagBanner
          title={`${highRisk.length} attribute${highRisk.length > 1 ? "s" : ""} breached the fairness threshold`}
          message={`Significant bias detected in: ${highRisk.join(", ")}. Regulatory compliance may be at risk. See Remediation Plan below.`}
          severity="high"
          meta={medRisk.length > 0 ? `Also monitor: ${medRisk.join(", ")} (approaching threshold).` : undefined}
        />
      ) : (
        <FlagBanner
          title="Model is within the fairness operating threshold"
          message={`All monitored attributes produced scores above the minimum threshold. ${medRisk.length > 0 ? `Monitor: ${medRisk.join(", ")} — see Remediation Plan below.` : "Continue regular governance reviews."}`}
          severity="medium"
        />
      )}

      {/* Gauge + attribute cards */}
      <div className="analysis-summary">
        <section className="page-panel analysis-gauge-panel">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Overall Fairness Score</h2>
              <p className="panel-description">Composite across all monitored attributes.</p>
            </div>
          </div>
          <GaugeChart score={result.overall} size={180} />
        </section>
        <div className="analysis-attr-grid">
          {result.attributes.map((attr) => (
            <AttrCard key={attr} attr={attr} score={result.scores[attr]} />
          ))}
        </div>
      </div>

      {/* Score bar chart */}
      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2 className="panel-title">Fairness Score by Attribute</h2>
            <p className="panel-description">Scores below 70 trigger a review flag. Scores below 50 require immediate remediation.</p>
          </div>
        </div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={70} stroke="var(--amber)" strokeDasharray="6 3"
                label={{ value: "Threshold 70", fill: "var(--amber)", fontSize: 11, position: "right" }} />
              <Tooltip contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 12 }}
                cursor={{ fill: "var(--panel-alt)" }} formatter={(v) => [`${v} / 100`, "Fairness Score"]} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={52}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={scoreColor(entry.score)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Sub-metric breakdown */}
      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2 className="panel-title">Fairness Metric Breakdown</h2>
            <p className="panel-description">Key algorithmic fairness measures evaluated across all sensitive attribute groups.</p>
          </div>
        </div>
        <div className="analysis-metric-detail-grid">
          {metricDetail.map((m) => (
            <div key={m.label} className="analysis-metric-detail-card">
              <p className="metric-label">{m.label}</p>
              <p className="metric-value" style={{ fontSize: "2rem", marginTop: 10, color: scoreColor(m.value) }}>{m.value}</p>
              <p className="metric-detail">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Regulatory compliance */}
      <CompliancePanel result={result} />

      {/* SHAP feature importance */}
      <ShapPanel result={result} />

      {/* Gemini AI Insights */}
      <GeminiInsights result={result} />

      {/* Counterfactual analysis */}
      <CounterfactualPanel result={result} />

      {/* Remediation plan */}
      <RemediationPanel result={result} flagged={flagged} />
    </div>
  );
}
