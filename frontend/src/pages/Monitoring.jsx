import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, TrendingDown, TrendingUp, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import PageHeader from "../components/PageHeader";
import useAnalysisStore from "../store/useAnalysisStore";

const STATIC_MODELS = [
  { id: "m1", name: "Loan Approval v4", outcome: "loan_approved", owner: "Credit Risk", baseScore: 74, deployedDays: 45, status: "healthy" },
  { id: "m2", name: "Hiring Classifier v3", outcome: "hiring_decision", owner: "Talent Operations", baseScore: 61, deployedDays: 12, status: "drifting" },
  { id: "m3", name: "Claims Triage v2", outcome: "claims_approved", owner: "Claims Governance", baseScore: 88, deployedDays: 90, status: "healthy" },
];

const DRIFT_ALERTS = [
  { id: "a1", model: "Hiring Classifier v3", attr: "gender", message: "Gender fairness score dropped 8 points over the last 7 days. Positive outcome rate gap widening.", time: "2 hours ago", severity: "high" },
  { id: "a2", model: "Loan Approval v4", attr: "age", message: "Age group 55–65 approval rate trending below 80% threshold. Approaching ECOA violation.", time: "1 day ago", severity: "medium" },
  { id: "a3", model: "Claims Triage v2", attr: "race", message: "Data distribution shift detected in income cohort. Fairness score stable but input drift logged.", time: "3 days ago", severity: "low" },
];

function generateTrend(baseScore, days) {
  const points = [];
  let score = baseScore;
  const step = Math.max(1, Math.floor(days / 7));
  for (let i = days; i >= 0; i -= step) {
    const jitter = (Math.sin(i * 0.7) * 4 + Math.cos(i * 1.3) * 3);
    score = Math.min(98, Math.max(20, Math.round(baseScore + jitter)));
    points.push({ day: `Day ${days - i + 1}`, score, threshold: 70 });
  }
  return points.slice(0, 8);
}

function statusColor(status) {
  if (status === "healthy") return "var(--green)";
  if (status === "drifting") return "var(--amber)";
  return "var(--red)";
}

function ModelCard({ model, onRefresh }) {
  const trend = generateTrend(model.baseScore, model.deployedDays);
  const latest = trend[trend.length - 1]?.score ?? model.baseScore;
  const prev    = trend[trend.length - 2]?.score ?? model.baseScore;
  const delta   = latest - prev;

  return (
    <div className="monitor-card">
      <div className="monitor-card-header">
        <div>
          <div className="monitor-status-dot" style={{ background: statusColor(model.status) }} />
          <h3 className="monitor-model-name">{model.name}</h3>
          <p className="monitor-model-meta">{model.outcome.replace(/_/g, " ")} · {model.owner} · Deployed {model.deployedDays}d ago</p>
        </div>
        <div className="monitor-score-block">
          <span className="monitor-score" style={{ color: latest >= 70 ? "var(--green)" : latest >= 50 ? "var(--amber)" : "var(--red)" }}>
            {latest}
          </span>
          <span className="monitor-delta" style={{ color: delta >= 0 ? "var(--green)" : "var(--red)" }}>
            {delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {delta >= 0 ? "+" : ""}{delta}
          </span>
        </div>
      </div>

      <div style={{ height: 100, marginTop: 10 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${model.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={statusColor(model.status)} stopOpacity={0.25} />
                <stop offset="95%" stopColor={statusColor(model.status)} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fill: "var(--muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={70} stroke="var(--amber)" strokeDasharray="4 2" strokeWidth={1} />
            <Tooltip
              contentStyle={{ background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 10, fontSize: 12 }}
              formatter={(v) => [`${v}`, "Fairness Score"]}
            />
            <Area type="monotone" dataKey="score" stroke={statusColor(model.status)} strokeWidth={2}
              fill={`url(#fill-${model.id})`} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="monitor-card-footer">
        <span className={`monitor-status-badge monitor-${model.status}`}>
          {model.status === "healthy" ? <CheckCircle size={13} /> : <AlertTriangle size={13} />}
          {model.status === "healthy" ? "Healthy" : model.status === "drifting" ? "Drift Detected" : "Critical"}
        </span>
        <button className="btn btn-secondary" style={{ fontSize: "0.78rem", padding: "5px 12px" }} onClick={onRefresh}>
          <RefreshCw size={13} /> Trigger Review
        </button>
      </div>
    </div>
  );
}

function AlertRow({ alert }) {
  const color = alert.severity === "high" ? "var(--red)" : alert.severity === "medium" ? "var(--amber)" : "var(--muted)";
  return (
    <div className="monitor-alert-row">
      <span className="monitor-alert-dot" style={{ background: color }} />
      <div className="monitor-alert-body">
        <p className="monitor-alert-title">
          <strong>{alert.model}</strong> — {alert.attr} drift
        </p>
        <p className="monitor-alert-msg">{alert.message}</p>
      </div>
      <span className="monitor-alert-time">
        <Clock size={12} style={{ marginRight: 4 }} />{alert.time}
      </span>
    </div>
  );
}

export default function Monitoring() {
  const history = useAnalysisStore((s) => s.history);
  const [refreshed, setRefreshed] = useState(null);

  function handleRefresh(id) {
    setRefreshed(id);
    setTimeout(() => setRefreshed(null), 2000);
  }

  // Derive live model cards from recent unique analyses
  const liveModels = Object.values(
    history.reduce((acc, run) => {
      const key = run.targetOutcome;
      if (!acc[key]) acc[key] = run;
      return acc;
    }, {}),
  ).slice(0, 3).map((run, i) => ({
    id: `live-${run.id}`,
    name: run.fileName,
    outcome: run.targetOutcome,
    owner: run.owner,
    baseScore: run.overall,
    deployedDays: Math.max(1, i + 1),
    status: run.overall >= 70 ? "healthy" : run.overall >= 50 ? "drifting" : "critical",
  }));

  const models = liveModels.length > 0 ? liveModels : STATIC_MODELS;
  const healthyCount  = models.filter((m) => m.status === "healthy").length;
  const driftingCount = models.filter((m) => m.status === "drifting").length;
  const criticalCount = models.filter((m) => m.status === "critical").length;

  return (
    <div className="basic-page">
      <PageHeader
        eyebrow="Continuous Monitoring"
        title="Production Model Health"
        description="Real-time fairness monitoring for deployed models. Drift detection alerts when fairness scores deviate from baseline or data distributions shift."
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "var(--green-soft)", border: "1px solid var(--green)", borderRadius: 999, fontSize: "0.85rem", fontWeight: 700, color: "var(--green)" }}>
            <Wifi size={14} /> Live Monitoring Active
          </div>
        }
      />

      {/* KPI strip */}
      <div className="monitor-kpi-strip">
        <div className="monitor-kpi">
          <Activity size={20} color="var(--navy)" />
          <div>
            <p className="monitor-kpi-value">{models.length}</p>
            <p className="monitor-kpi-label">Models Monitored</p>
          </div>
        </div>
        <div className="monitor-kpi">
          <CheckCircle size={20} color="var(--green)" />
          <div>
            <p className="monitor-kpi-value" style={{ color: "var(--green)" }}>{healthyCount}</p>
            <p className="monitor-kpi-label">Healthy</p>
          </div>
        </div>
        <div className="monitor-kpi">
          <AlertTriangle size={20} color="var(--amber)" />
          <div>
            <p className="monitor-kpi-value" style={{ color: "var(--amber)" }}>{driftingCount}</p>
            <p className="monitor-kpi-label">Drift Detected</p>
          </div>
        </div>
        <div className="monitor-kpi">
          <AlertTriangle size={20} color="var(--red)" />
          <div>
            <p className="monitor-kpi-value" style={{ color: "var(--red)" }}>{criticalCount}</p>
            <p className="monitor-kpi-label">Critical</p>
          </div>
        </div>
      </div>

      {/* Model health cards */}
      <div className="monitor-grid">
        {models.map((m) => (
          <ModelCard
            key={m.id}
            model={refreshed === m.id ? { ...m, status: "healthy" } : m}
            onRefresh={() => handleRefresh(m.id)}
          />
        ))}
      </div>

      {/* Drift alerts */}
      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2 className="panel-title">Drift Detection Alerts</h2>
            <p className="panel-description">
              Automatically generated when fairness scores deviate more than 5 points from baseline or data distributions shift significantly.
            </p>
          </div>
          <span className="panel-note">{DRIFT_ALERTS.length} active alerts</span>
        </div>
        <div>
          {DRIFT_ALERTS.map((alert) => (
            <AlertRow key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      {/* What triggers re-analysis */}
      <section className="page-panel">
        <div className="panel-heading">
          <div>
            <h2 className="panel-title">Automated Re-Analysis Triggers</h2>
            <p className="panel-description">
              The monitoring system automatically queues a fairness re-analysis when any of the following conditions are met.
            </p>
          </div>
        </div>
        <div className="monitor-trigger-grid">
          {[
            { icon: TrendingDown, label: "Score Drop ≥ 5 pts", desc: "Any attribute fairness score drops more than 5 points from the last baseline." },
            { icon: AlertTriangle, label: "Threshold Breach", desc: "Overall fairness score crosses below the 70-point operating threshold." },
            { icon: Activity, label: "Input Distribution Shift", desc: "Demographic composition of incoming requests deviates from training distribution." },
            { icon: Clock, label: "Scheduled Quarterly Review", desc: "Automatic review queued every 90 days regardless of drift signals." },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="monitor-trigger-card">
              <Icon size={20} color="var(--navy)" />
              <h4 className="monitor-trigger-label">{label}</h4>
              <p className="monitor-trigger-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
