import useAnalysisStore from "../store/useAnalysisStore";

const SEED_ROWS = [
  {
    id: "seed-1",
    model: "Loan Approval Scoring",
    dataset: "credit_decisions_q2.csv",
    score: 46,
    risk: "high",
    updated: "2 hours ago",
    owner: "Credit Risk",
    status: "Escalated",
  },
  {
    id: "seed-2",
    model: "Hiring Model v3",
    dataset: "hiring_pipeline_oct.csv",
    score: 78,
    risk: "medium",
    updated: "Today",
    owner: "Talent Ops",
    status: "In review",
  },
  {
    id: "seed-3",
    model: "Claims Triage v2",
    dataset: "claims_triage_q4.csv",
    score: 88,
    risk: "low",
    updated: "Yesterday",
    owner: "Operations",
    status: "Compliant",
  },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function riskClass(risk) {
  if (risk === "high") return "risk-pill risk-high";
  if (risk === "medium") return "risk-pill risk-medium";
  return "risk-pill risk-low";
}

function statusClass(status) {
  if (status === "Escalated") return "status-pill status-danger";
  if (status === "In review") return "status-pill status-warning";
  return "status-pill status-success";
}

function scoreClass(score) {
  if (score < 50) return "table-strong score-low";
  if (score < 80) return "table-strong score-medium";
  return "table-strong score-high";
}

export default function RiskTable() {
  const history = useAnalysisStore((s) => s.history);

  const liveRows = history.map((run) => ({
    id: String(run.id),
    model: run.fileName,
    dataset: run.targetOutcome.replace(/_/g, " "),
    score: run.overall,
    risk: run.overall < 50 ? "high" : run.overall < 70 ? "medium" : "low",
    updated: timeAgo(run.runAt),
    owner: run.owner,
    status:
      run.overall < 50
        ? "Escalated"
        : run.overall < 70
          ? "In review"
          : "Compliant",
  }));

  const rows = [...liveRows, ...SEED_ROWS];

  return (
    <section className="table-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Flagged Portfolio Items</h2>
          <p className="panel-description">
            Current review inventory for models that require governance action
            or formal sign-off before deployment.
          </p>
        </div>
        {liveRows.length > 0 && (
          <span className="panel-note">
            {liveRows.length} live{" "}
            {liveRows.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      <div className="risk-table-wrap">
        <table className="risk-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Dataset / Outcome</th>
              <th>Fairness Score</th>
              <th>Risk</th>
              <th>Owner</th>
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="table-strong">{row.model}</td>
                <td>{row.dataset}</td>
                <td className={scoreClass(row.score)}>{row.score}</td>
                <td>
                  <span className={riskClass(row.risk)}>
                    {row.risk === "high"
                      ? "High Risk"
                      : row.risk === "medium"
                        ? "Medium Risk"
                        : "Low Risk"}
                  </span>
                </td>
                <td>{row.owner}</td>
                <td>{row.updated}</td>
                <td>
                  <span className={statusClass(row.status)}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
