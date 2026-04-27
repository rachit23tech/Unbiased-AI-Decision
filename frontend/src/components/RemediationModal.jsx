import { useEffect, useRef } from "react";
import {
  X, Wand2, ArrowRight, ShieldCheck, ShieldX,
  TrendingUp, Download, AlertTriangle, Sparkles,
} from "lucide-react";

// ── Simulation config ─────────────────────────────────────────────────────────

const TECHNIQUES = {
  gender:            { full: "Demographic Parity Reweighting + Threshold Calibration",   tag: "DPR + Calibration" },
  race:              { full: "Disparate Impact Remover + Training Data Resampling",       tag: "DIR + Resampling" },
  age:               { full: "Equal Opportunity Constraint + Age-Band Calibration",      tag: "EOC + Calibration" },
  disability_status: { full: "Equalized Odds Post-Processing",                           tag: "EO Post-processing" },
  nationality:       { full: "Fairness-Aware Feature Removal + Demographic Parity Constraint", tag: "Feature Removal + DPC" },
  religion:          { full: "Demographic Parity Constraint + Representation Audit",     tag: "DPC + Audit" },
};

const REGULATIONS = [
  { id: "ecoa", name: "ECOA", threshold: 80, applies: ["loan_approved", "credit_scoring", "insurance_risk"] },
  { id: "eeoc", name: "EEOC 4/5ths", threshold: 80, applies: ["hiring_decision"] },
  { id: "gdpr", name: "GDPR Art.22", threshold: 60, applies: ["loan_approved","hiring_decision","medical_diagnosis","medical_treatment","credit_scoring","insurance_risk","claims_approved","churn_prediction"] },
  { id: "euai", name: "EU AI Act", threshold: 70, applies: ["loan_approved","hiring_decision","medical_diagnosis","medical_treatment","credit_scoring"] },
  { id: "ada",  name: "ADA",       threshold: 70, applies: ["medical_diagnosis","medical_treatment","claims_approved","insurance_risk","hiring_decision"] },
];

/** Deterministic projected score — never uses Math.random */
function projectScore(current, attrIdx) {
  if (current >= 70) return Math.min(95, current + 3 + (attrIdx % 4));
  if (current >= 50) return Math.min(95, Math.max(76 + (attrIdx * 2) % 8, current + 15));
  return Math.min(95, Math.max(73 + (attrIdx * 3) % 10, current + 24));
}

function buildSimulation(result) {
  const projectedScores = {};
  const techniqueMap    = {};

  result.attributes.forEach((attr, idx) => {
    projectedScores[attr] = projectScore(result.scores[attr], idx);
    techniqueMap[attr]    = TECHNIQUES[attr] ?? { full: "Fairness-Aware Retraining", tag: "Fairness Retraining" };
  });

  const projectedOverall = Math.round(
    Object.values(projectedScores).reduce((a, b) => a + b, 0) / result.attributes.length,
  );

  return { projectedScores, projectedOverall, techniqueMap };
}

function downloadReport(result, sim) {
  const rows = result.attributes.map((attr) => ({
    attribute:         attr,
    current_score:     result.scores[attr],
    projected_score:   sim.projectedScores[attr],
    improvement:       `+${sim.projectedScores[attr] - result.scores[attr]}`,
    technique_applied: sim.techniqueMap[attr]?.full ?? "Fairness Retraining",
    will_comply:       sim.projectedScores[attr] >= 70 ? "Yes" : "No",
  }));

  const report = {
    title:       "Remediation Simulation Report",
    model:       result.fileName,
    outcome:     result.targetOutcome,
    owner:       result.owner,
    generatedAt: new Date().toISOString(),
    disclaimer:  "Projected scores based on standard algorithmic debiasing. Actual results require model retraining with fairness constraints.",
    current:     { overall: result.overall,        scores: result.scores },
    projected:   { overall: sim.projectedOverall,  scores: sim.projectedScores },
    attributes:  rows,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `remediation_${result.fileName.replace(/\.[^.]+$/, "")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ────────────────────────────────────────────────────────────

const scoreColor = (s) => s >= 70 ? "var(--green)" : s >= 50 ? "var(--amber)" : "var(--red)";

function ScorePill({ score, label }) {
  const color = scoreColor(score);
  return (
    <div className="sim-score-pill" style={{ "--pill-color": color }}>
      <span className="sim-score-num">{score}</span>
      <span className="sim-score-denom">/100</span>
      <span className="sim-score-label">{label}</span>
    </div>
  );
}

function ComplianceBadge({ passes }) {
  return passes
    ? <span className="sim-compliance-pass"><ShieldCheck size={13} /> Pass</span>
    : <span className="sim-compliance-fail"><ShieldX    size={13} /> Fail</span>;
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function RemediationModal({ result, onClose }) {
  const overlayRef = useRef(null);
  const sim = buildSimulation(result);
  const delta = sim.projectedOverall - result.overall;
  const crossesThreshold = result.overall < 70 && sim.projectedOverall >= 70;

  const applicableRegs = REGULATIONS.filter((r) => r.applies.includes(result.targetOutcome));

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on backdrop click
  function handleOverlay(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div className="sim-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="sim-modal" role="dialog" aria-modal="true" aria-label="Remediation Simulation">

        {/* ── Header ── */}
        <div className="sim-header">
          <div className="sim-header-left">
            <div className="sim-header-icon">
              <Wand2 size={18} />
            </div>
            <div>
              <h2 className="sim-title">Remediation Simulation</h2>
              <p className="sim-subtitle">{result.fileName} · {result.targetOutcome.replace(/_/g, " ")}</p>
            </div>
          </div>
          <button className="sim-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="sim-body">

          {/* Disclaimer */}
          <div className="sim-disclaimer">
            <AlertTriangle size={14} />
            <p>
              <strong>Projected results only.</strong> Scores are estimated based on standard algorithmic
              debiasing techniques. Actual improvement requires model retraining with fairness constraints applied.
            </p>
          </div>

          {/* Overall score comparison */}
          <section className="sim-section">
            <h3 className="sim-section-title">
              <TrendingUp size={15} /> Overall Fairness Score
            </h3>
            <div className="sim-score-row">
              <ScorePill score={result.overall} label="Current" />

              <div className="sim-arrow">
                <div className="sim-delta-badge">
                  <Sparkles size={12} />
                  +{delta} pts
                </div>
                <ArrowRight size={22} color="var(--teal)" />
              </div>

              <ScorePill score={sim.projectedOverall} label="Projected" />
            </div>

            {crossesThreshold && (
              <div className="sim-threshold-note">
                <ShieldCheck size={14} color="var(--green)" />
                Projected score crosses the approval threshold of 70 — model would be auto-approved.
              </div>
            )}
          </section>

          {/* Per-attribute breakdown */}
          <section className="sim-section">
            <h3 className="sim-section-title">Per-Attribute Breakdown</h3>
            <div className="sim-table-wrap">
              <table className="sim-table">
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th>Current</th>
                    <th>Technique Applied</th>
                    <th>Projected</th>
                    <th>Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {result.attributes.map((attr) => {
                    const curr = result.scores[attr];
                    const proj = sim.projectedScores[attr];
                    const diff = proj - curr;
                    const tech = sim.techniqueMap[attr];
                    return (
                      <tr key={attr}>
                        <td className="sim-attr-name">{attr.replace(/_/g, " ")}</td>
                        <td>
                          <span className="sim-score-chip" style={{ color: scoreColor(curr), background: `color-mix(in srgb, ${scoreColor(curr)} 12%, transparent)` }}>
                            {curr}
                          </span>
                        </td>
                        <td>
                          <span className="sim-tech-tag">{tech.tag}</span>
                          <p className="sim-tech-full">{tech.full}</p>
                        </td>
                        <td>
                          <span className="sim-score-chip" style={{ color: scoreColor(proj), background: `color-mix(in srgb, ${scoreColor(proj)} 12%, transparent)` }}>
                            {proj}
                          </span>
                        </td>
                        <td>
                          <span className="sim-delta-chip">+{diff}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Regulatory compliance projection */}
          {applicableRegs.length > 0 && (
            <section className="sim-section">
              <h3 className="sim-section-title">Projected Compliance</h3>
              <div className="sim-compliance-grid">
                {applicableRegs.map((reg) => {
                  const wasFailing = result.overall < reg.threshold;
                  const willPass   = sim.projectedOverall >= reg.threshold;
                  return (
                    <div key={reg.id} className={`sim-compliance-card ${willPass ? "sim-comp-pass" : "sim-comp-fail"}`}>
                      <div className="sim-compliance-top">
                        <span className="sim-reg-name">{reg.name}</span>
                        <ComplianceBadge passes={willPass} />
                      </div>
                      {wasFailing && willPass && (
                        <p className="sim-compliance-change">↑ Non-compliant → Compliant</p>
                      )}
                      <p className="sim-compliance-req">Requires ≥ {reg.threshold}</p>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* What happens next */}
          <section className="sim-section sim-next-steps">
            <h3 className="sim-section-title">Implementation Roadmap</h3>
            <ol className="sim-steps-list">
              <li>Engage the ML engineering team with this remediation report as the brief.</li>
              <li>Re-train the model using the techniques listed above per attribute.</li>
              <li>Run a new fairness analysis on the retrained model — upload it here for verification.</li>
              <li>Submit the verified model for governance approval through this platform.</li>
              <li>Monitor for fairness drift in production using the Monitoring page.</li>
            </ol>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="sim-footer">
          <button
            className="btn btn-secondary"
            onClick={() => downloadReport(result, sim)}
          >
            <Download size={15} /> Download Report
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
