import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import PageHeader from "../components/PageHeader";
import useAnalysisStore from "../store/useAnalysisStore";

const SEED_REPORTS = [
  { id: "seed-1", name: "Hiring Model Fairness Audit", type: "Model Audit", risk: "medium", owner: "Talent Operations", updated: "Today", status: "Awaiting approval", approvalStatus: "pending" },
  { id: "seed-2", name: "Loan Approval Scoring Review", type: "Portfolio Escalation", risk: "high", owner: "Credit Risk", updated: "2 hours ago", status: "Escalated", approvalStatus: "rejected" },
  { id: "seed-3", name: "Claims Triage Quarterly Audit", type: "Quarterly Review", risk: "low", owner: "Claims Governance", updated: "Yesterday", status: "Archived", approvalStatus: "approved" },
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
  if (status === "Escalated" || status === "rejected") return "status-pill status-danger";
  if (status === "Awaiting approval" || status === "pending") return "status-pill status-warning";
  return "status-pill status-success";
}

function ApprovalBadge({ status }) {
  if (status === "approved") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--green)", fontSize: "0.82rem", fontWeight: 700 }}>
      <CheckCircle size={14} /> Approved
    </span>
  );
  if (status === "rejected") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--red)", fontSize: "0.82rem", fontWeight: 700 }}>
      <XCircle size={14} /> Rejected
    </span>
  );
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--amber)", fontSize: "0.82rem", fontWeight: 700 }}>
      <Clock size={14} /> Pending
    </span>
  );
}

export default function Reports() {
  const history = useAnalysisStore((s) => s.history);
  const approveRun = useAnalysisStore((s) => s.approveRun);
  const rejectRun = useAnalysisStore((s) => s.rejectRun);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const liveReports = history.map((run) => {
    const risk = run.overall < 50 ? "high" : run.overall < 70 ? "medium" : "low";
    return {
      id: run.id,
      name: `${run.fileName} — ${run.targetOutcome.replace(/_/g, " ")}`,
      type: "Fairness Analysis",
      risk,
      owner: run.owner,
      updated: timeAgo(run.runAt),
      status: run.overall < 50 ? "Escalated" : run.overall < 70 ? "Awaiting approval" : "Compliant",
      approvalStatus: run.approvalStatus ?? "pending",
      score: run.overall,
      isLive: true,
    };
  });

  const allReports = [...liveReports, ...SEED_REPORTS];

  const filtered = useMemo(
    () =>
      allReports.filter((r) => {
        const matchRisk = riskFilter === "all" || r.risk === riskFilter;
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchApproval = approvalFilter === "all" || r.approvalStatus === approvalFilter;
        return matchRisk && matchSearch && matchApproval;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [riskFilter, search, approvalFilter, history],
  );

  const pendingCount = liveReports.filter((r) => r.approvalStatus === "pending").length;

  return (
    <div className="basic-page">
      <PageHeader
        eyebrow="Audit Outputs"
        title="Reports"
        description="Review generated fairness audits, track sign-off status, and export materials for stakeholders, regulators, and internal committees."
      />

      {pendingCount > 0 && (
        <div className="approval-banner">
          <Clock size={16} color="var(--amber)" />
          <span>
            <strong>{pendingCount} analysis {pendingCount === 1 ? "result requires" : "results require"} governance sign-off.</strong>
            {" "}Approve or reject below before models proceed to production.
          </span>
        </div>
      )}

      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2 className="panel-title">Recent Report Activity</h2>
            <p className="panel-description">
              Generated outputs tied to the current executive review cycle.
            </p>
          </div>
          {liveReports.length > 0 && (
            <span className="panel-note">
              {liveReports.length} live {liveReports.length === 1 ? "analysis" : "analyses"}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="reports-toolbar" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <label className="field-label reports-field">
            Search
            <input className="field-input" type="text" value={search}
              onChange={(e) => setSearch(e.target.value)} placeholder="Search by report name" />
          </label>
          <label className="field-label reports-field">
            Risk Level
            <select className="field-input" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
              <option value="all">All risk levels</option>
              <option value="high">High risk</option>
              <option value="medium">Medium risk</option>
              <option value="low">Low risk</option>
            </select>
          </label>
          <label className="field-label reports-field">
            Approval Status
            <select className="field-input" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending sign-off</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>

        <div className="risk-table-wrap">
          <table className="risk-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Type</th>
                <th>Risk</th>
                <th>Owner</th>
                <th>Updated</th>
                <th>Status</th>
                <th>Sign-off</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}>No reports match the current filters.</td></tr>
              ) : (
                filtered.map((report) => (
                  <tr key={report.id}>
                    <td className="table-strong">{report.name}</td>
                    <td>{report.type}</td>
                    <td>
                      <span className={riskClass(report.risk)}>
                        {report.risk === "high" ? "High Risk" : report.risk === "medium" ? "Medium Risk" : "Low Risk"}
                      </span>
                    </td>
                    <td>{report.owner}</td>
                    <td>{report.updated}</td>
                    <td><span className={statusClass(report.status)}>{report.status}</span></td>
                    <td><ApprovalBadge status={report.approvalStatus} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {report.isLive && report.approvalStatus === "pending" && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: "0.78rem", padding: "4px 10px", color: "var(--green)", borderColor: "var(--green)" }}
                              onClick={() => approveRun(report.id)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ fontSize: "0.78rem", padding: "4px 10px", color: "var(--red)", borderColor: "var(--red)" }}
                              onClick={() => rejectRun(report.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {report.isLive && (
                          <Link to="/analysis"
                            className="btn btn-secondary"
                            style={{ fontSize: "0.78rem", padding: "4px 10px" }}>
                            View
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
