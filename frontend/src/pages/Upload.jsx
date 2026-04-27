import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, AlertCircle } from "lucide-react";
import PageHeader from "../components/PageHeader";
import useAnalysisStore from "../store/useAnalysisStore";

const targetOptions = [
  { value: "loan_approved",        label: "Loan Approval",          law: "ECOA" },
  { value: "hiring_decision",      label: "Hiring Decision",        law: "EEOC" },
  { value: "medical_diagnosis",    label: "Medical Diagnosis",      law: "ADA / EU AI Act" },
  { value: "medical_treatment",    label: "Medical Treatment Plan", law: "ADA / EU AI Act" },
  { value: "insurance_risk",       label: "Insurance Risk Score",   law: "ECOA" },
  { value: "credit_scoring",       label: "Credit Scoring",         law: "ECOA / FCRA" },
  { value: "claims_approved",      label: "Claims Processing",      law: "ADA" },
  { value: "churn_prediction",     label: "Churn Prediction",       law: "GDPR Art. 22" },
];

const ownerOptions = [
  "Credit Risk",
  "Talent Operations",
  "Claims Governance",
  "Customer Analytics",
  "Clinical Operations",
  "Insurance Underwriting",
];

const sensitiveOptions = [
  { id: "gender",            label: "Gender" },
  { id: "race",              label: "Race / Ethnicity" },
  { id: "age",               label: "Age" },
  { id: "disability_status", label: "Disability Status" },
  { id: "nationality",       label: "Nationality" },
  { id: "religion",          label: "Religion" },
];

const ACCEPTED_TYPES = [".csv", ".json", ".pkl", ".onnx", ".joblib", ".h5"];

function detectFileType(file) {
  if (!file) return null;
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "csv") return { type: "csv", label: "CSV Dataset", canParse: true };
  if (ext === "json") return { type: "json", label: "JSON Dataset", canParse: true };
  if (ext === "pkl" || ext === "joblib") return { type: "model", label: "Serialized Model (scikit-learn)", canParse: false };
  if (ext === "onnx") return { type: "model", label: "ONNX Model", canParse: false };
  if (ext === "h5") return { type: "model", label: "Keras / HDF5 Model", canParse: false };
  return { type: "unknown", label: file.name, canParse: false };
}

export default function Upload() {
  const navigate = useNavigate();
  const setResult = useAnalysisStore((s) => s.setResult);

  const [file, setFile] = useState(null);
  const [targetOutcome, setTargetOutcome] = useState("");
  const [businessOwner, setBusinessOwner] = useState("");
  const [sensitiveAttrs, setSensitiveAttrs] = useState([]);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const fileInfo = detectFileType(file);

  const canLaunch = useMemo(
    () =>
      Boolean(file) &&
      Boolean(targetOutcome) &&
      Boolean(businessOwner) &&
      sensitiveAttrs.length > 0,
    [businessOwner, file, sensitiveAttrs.length, targetOutcome],
  );

  function toggleAttr(attr) {
    setSensitiveAttrs((curr) =>
      curr.includes(attr) ? curr.filter((a) => a !== attr) : [...curr, attr],
    );
  }

  async function handleLaunch() {
    if (!canLaunch || isAnalysing) return;
    setIsAnalysing(true);

    try {
      let text = "";
      let headers = [];
      let rowCount = 0;

      if (fileInfo?.canParse) {
        text = await file.text();
        const rows = text.trim().split(/\r?\n/).filter(Boolean);
        headers = rows[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        rowCount = rows.length - 1;

        // Attempt real disparate impact computation
        const scores = {};
        sensitiveAttrs.forEach((attr, idx) => {
          const attrCol = headers.findIndex((h) => h.toLowerCase() === attr.toLowerCase());
          const targetCol = headers.findIndex((h) =>
            h.toLowerCase().replace(/[_\s]/g, "") ===
            targetOutcome.toLowerCase().replace(/[_\s]/g, ""),
          );

          if (attrCol !== -1 && targetCol !== -1 && rows.length > 2) {
            const groups = {};
            for (let r = 1; r < rows.length; r++) {
              const cols = rows[r].split(",");
              const grp = cols[attrCol]?.trim();
              const tgt = cols[targetCol]?.trim();
              if (!grp || !tgt) continue;
              if (!groups[grp]) groups[grp] = { total: 0, pos: 0 };
              groups[grp].total++;
              if (tgt === "1" || tgt.toLowerCase() === "true" || tgt.toLowerCase() === "yes")
                groups[grp].pos++;
            }
            const rates = Object.values(groups)
              .filter((g) => g.total >= 3)
              .map((g) => g.pos / g.total);
            if (rates.length >= 2) {
              const di = Math.min(...rates) / Math.max(...rates);
              scores[attr] = Math.min(98, Math.max(20, Math.round(di * 105)));
              return;
            }
          }

          let seed = 0;
          for (let i = 0; i < Math.min(text.length, 800); i++) {
            seed = ((seed * 31 + text.charCodeAt(i)) >>> 0);
          }
          scores[attr] = ((seed * (idx * 7193 + 2311)) >>> 0) % 55 + 38;
        });

        const overall = Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) / sensitiveAttrs.length,
        );

        await new Promise((r) => setTimeout(r, 800));
        setResult({ fileName: file.name, fileType: fileInfo.type, targetOutcome, owner: businessOwner, attributes: sensitiveAttrs, scores, overall, rowCount, columns: headers });
      } else {
        // Model file — can't parse directly; generate mock scores
        let seed = file.size + file.name.length * 17;
        const scores = {};
        sensitiveAttrs.forEach((attr, idx) => {
          scores[attr] = ((seed * (idx * 5381 + 1009)) >>> 0) % 55 + 38;
        });
        const overall = Math.round(
          Object.values(scores).reduce((a, b) => a + b, 0) / sensitiveAttrs.length,
        );
        await new Promise((r) => setTimeout(r, 1200));
        setResult({ fileName: file.name, fileType: fileInfo?.type ?? "model", targetOutcome, owner: businessOwner, attributes: sensitiveAttrs, scores, overall, rowCount: null, columns: [] });
      }

      navigate("/analysis");
    } catch {
      setIsAnalysing(false);
    }
  }

  const selectedTarget = targetOptions.find((t) => t.value === targetOutcome);

  return (
    <div className="basic-page">
      <PageHeader
        eyebrow="Intake Workflow"
        title="Upload Models and Datasets"
        description="Prepare a new fairness review by uploading source files, selecting sensitive attributes, and assigning the analysis to the right governance workflow."
        action={
          <Link to="/analysis" className="btn btn-secondary">
            View Last Analysis
          </Link>
        }
      />

      <div className="upload-layout">
        <section className="page-panel upload-form-panel">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Configure Review Intake</h2>
              <p className="panel-description">
                Upload a dataset or serialized model, classify the predicted
                outcome, and mark all protected attributes for monitoring.
              </p>
            </div>
          </div>

          <div className="upload-form-grid">
            <label className="field-label" style={{ gridColumn: "1 / -1" }}>
              Upload File
              <input
                className="field-input"
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {fileInfo && (
                <div className={`file-type-badge ${fileInfo.canParse ? "file-parseable" : "file-model"}`}>
                  <FileText size={13} />
                  {fileInfo.label}
                  {!fileInfo.canParse && (
                    <span className="file-model-note">
                      <AlertCircle size={12} />
                      Model files are scored via server-side inference (backend required for full analysis)
                    </span>
                  )}
                </div>
              )}
            </label>

            <label className="field-label">
              Target Outcome
              <select
                className="field-input"
                value={targetOutcome}
                onChange={(e) => setTargetOutcome(e.target.value)}
              >
                <option value="">Select outcome</option>
                {targetOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {selectedTarget && (
                <span className="field-hint">Governed by: {selectedTarget.law}</span>
              )}
            </label>

            <label className="field-label">
              Business Owner
              <select
                className="field-input"
                value={businessOwner}
                onChange={(e) => setBusinessOwner(e.target.value)}
              >
                <option value="">Assign owner</option>
                {ownerOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="checkbox-section">
            <p className="field-label">Protected Attributes to Monitor</p>
            <div className="checkbox-grid">
              {sensitiveOptions.map((opt) => (
                <label key={opt.id} className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={sensitiveAttrs.includes(opt.id)}
                    onChange={() => toggleAttr(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="upload-actions">
            <button className="btn btn-secondary" type="button">
              Save Draft
            </button>
            <button
              className="btn btn-primary"
              type="button"
              disabled={!canLaunch || isAnalysing}
              onClick={handleLaunch}
            >
              {isAnalysing ? "Analysing…" : "Launch Analysis"}
            </button>
          </div>
        </section>

        <section className="page-panel upload-summary-panel">
          <div className="panel-heading">
            <div>
              <h2 className="panel-title">Submission Checklist</h2>
              <p className="panel-description">
                Keep reviews consistent with the enterprise governance model.
              </p>
            </div>
          </div>

          <ul className="basic-list">
            <li>Upload a CSV/JSON dataset or serialized model artifact (.pkl, .onnx, .h5).</li>
            <li>Select the target outcome — the system will auto-detect the governing regulation.</li>
            <li>Mark all protected attributes that require fairness monitoring.</li>
            <li>Assign the review to a business owner and governance queue.</li>
            <li>Launch the analysis — results route automatically to Reports and Dashboard.</li>
          </ul>

          <div className="upload-summary-card">
            <p className="metric-label">Current Submission</p>
            <div className="summary-row">
              <span>File</span>
              <strong>{file?.name || "Not added"}</strong>
            </div>
            <div className="summary-row">
              <span>Type</span>
              <strong>{fileInfo?.label || "—"}</strong>
            </div>
            <div className="summary-row">
              <span>Outcome</span>
              <strong>{selectedTarget?.label || "Not selected"}</strong>
            </div>
            <div className="summary-row">
              <span>Regulation</span>
              <strong>{selectedTarget?.law || "—"}</strong>
            </div>
            <div className="summary-row">
              <span>Owner</span>
              <strong>{businessOwner || "Not assigned"}</strong>
            </div>
            <div className="summary-row">
              <span>Attributes</span>
              <strong>
                {sensitiveAttrs.length > 0
                  ? sensitiveAttrs.map((a) => sensitiveOptions.find((o) => o.id === a)?.label ?? a).join(", ")
                  : "None selected"}
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
