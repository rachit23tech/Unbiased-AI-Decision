import { useState } from "react";
import { Copy, Check, Plus, X, UserPlus, SlidersHorizontal } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { loadParams, saveParams, DEFAULT_PARAMS } from "../utils/approvalParams";

const TABS = ["Account", "Security & Roles", "Integrations"];

const SEED_MEMBERS = [
  { initials: "JD", name: "Jane Doe",     email: "jane.doe@example.com", role: "Admin"   },
  { initials: "MK", name: "Marcus Kim",   email: "m.kim@example.com",    role: "Analyst" },
  { initials: "PS", name: "Priya Sharma", email: "p.sharma@example.com", role: "Viewer"  },
];

function getInitials(name) {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const auditLog = [
  { action: "Analysis completed — Hiring Model v3", user: "Jane Doe", time: "2 hr ago", color: "#2f855a" },
  { action: "Report downloaded — Loan Approval Audit", user: "Marcus Kim", time: "5 hr ago", color: "#17324d" },
  { action: "New member invited — Priya Sharma", user: "Jane Doe", time: "1 day ago", color: "#166c63" },
  { action: "High-risk model flagged — Loan Approval Scoring", user: "System", time: "2 days ago", color: "#b34a4a" },
];

function generateKey(prefix) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const rand = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}_${rand}`;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button className="btn btn-secondary" style={{ fontSize: "0.83rem", padding: "6px 12px" }} onClick={handleCopy}>
      {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [escalationAlerts, setEscalationAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [saved, setSaved] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "Production API Key", key: generateKey("ak_prod"), created: "Oct 12, 2023", active: true },
    { id: 2, name: "CI Integration Key",  key: generateKey("ak_ci"),   created: "Sep 5, 2023",  active: true },
  ]);
  const [webhookTested, setWebhookTested] = useState(false);
  const [approvalParams, setApprovalParams] = useState(loadParams);
  const [paramsSaved, setParamsSaved] = useState(false);

  function handleSaveParams(e) {
    e.preventDefault();
    saveParams(approvalParams);
    setParamsSaved(true);
    setTimeout(() => setParamsSaved(false), 2200);
  }

  const [members, setMembers] = useState(SEED_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Analyst");
  const [inviteSent, setInviteSent] = useState(false);

  function handleInvite(e) {
    e.preventDefault();
    if (!inviteEmail) return;
    const name = inviteName.trim() || inviteEmail.split("@")[0];
    setMembers((prev) => [
      ...prev,
      { initials: getInitials(name), name, email: inviteEmail.toLowerCase(), role: inviteRole },
    ]);
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("Analyst");
    }, 1800);
  }

  function handleGenerateKey() {
    const newKey = { id: Date.now(), name: "New API Key", key: generateKey("ak_new"), created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), active: true };
    setApiKeys((prev) => [...prev, newKey]);
  }

  function handleWebhookTest(e) {
    e.preventDefault();
    setWebhookTested(true);
    setTimeout(() => setWebhookTested(false), 3000);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="basic-page">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Manage governance defaults, user roles, and operational preferences for the fairness review program."
      />

      {/* Tab navigation */}
      <div className="settings-tabs" role="tablist">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === i}
            className={"settings-tab" + (activeTab === i ? " active" : "")}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── ACCOUNT TAB ── */}
      {activeTab === 0 && (
        <div className="settings-content-grid">
          {/* Profile form */}
          <section className="page-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Profile Details</h2>
                <p className="panel-description">
                  Update your name, contact information, and personal preferences.
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="field-stack">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <label className="field-label">
                  Full Name
                  <input className="field-input" type="text" defaultValue="Jane Doe" />
                </label>
                <label className="field-label">
                  Job Title
                  <input className="field-input" type="text" defaultValue="ML Engineer" />
                </label>
              </div>
              <label className="field-label">
                Email Address
                <input className="field-input" type="email" defaultValue="jane.doe@example.com" />
              </label>
              <label className="field-label">
                Organization
                <input className="field-input" type="text" defaultValue="Acme Corp" />
              </label>
              <div style={{ marginTop: 8 }}>
                <button
                  type="submit"
                  className={"btn " + (saved ? "" : "btn-primary")}
                  style={saved ? { background: "var(--green-soft)", color: "var(--green)", border: "1px solid var(--green)" } : {}}
                >
                  {saved ? "Changes saved" : "Save Profile"}
                </button>
              </div>
            </form>
          </section>

          {/* Notification preferences */}
          <section className="page-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Notification Preferences</h2>
                <p className="panel-description">
                  Choose when the platform sends alerts and digests.
                </p>
              </div>
            </div>

            <div>
              {[
                { label: "Analysis completion alerts", desc: "Email when a fairness job finishes.", checked: emailNotifs, set: setEmailNotifs },
                { label: "High-risk model escalations", desc: "Immediate alert when a model breaches threshold.", checked: escalationAlerts, set: setEscalationAlerts },
                { label: "Weekly fairness digest", desc: "Summary of portfolio health every Monday.", checked: weeklyDigest, set: setWeeklyDigest },
              ].map((pref) => (
                <div key={pref.label} className="toggle-wrap">
                  <div>
                    <p className="toggle-label">{pref.label}</p>
                    <p className="toggle-desc">{pref.desc}</p>
                  </div>
                  <button
                    type="button"
                    className="toggle-btn"
                    aria-checked={String(pref.checked)}
                    onClick={() => pref.set((v) => !v)}
                  >
                    <span
                      className="toggle-knob"
                      style={{ left: pref.checked ? 23 : 3 }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── SECURITY & ROLES TAB ── */}
      {activeTab === 1 && (
        <div className="settings-content-grid">
          <section className="page-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Team Members</h2>
                <p className="panel-description">
                  Manage role-based access across the review and governance platform.
                </p>
              </div>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "0.88rem", padding: "8px 14px" }}
                onClick={() => setShowInvite((v) => !v)}
              >
                <UserPlus size={14} />
                {showInvite ? "Cancel" : "Invite Member"}
              </button>
            </div>

            {/* Invite form */}
            {showInvite && (
              <form className="invite-form" onSubmit={handleInvite}>
                <div className="invite-form-fields">
                  <label className="field-label" style={{ margin: 0 }}>
                    Name (optional)
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Full name"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </label>
                  <label className="field-label" style={{ margin: 0 }}>
                    Email address
                    <input
                      className="field-input"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field-label" style={{ margin: 0 }}>
                    Role
                    <select
                      className="field-input"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option>Admin</option>
                      <option>Analyst</option>
                      <option>Viewer</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={inviteSent}
                  style={inviteSent ? { background: "var(--green-soft)", color: "var(--green)", border: "1px solid var(--green)" } : {}}
                >
                  {inviteSent ? "✓ Invitation sent" : "Send Invitation"}
                </button>
              </form>
            )}

            <div>
              {members.map((m) => (
                <div key={m.email} className="member-row">
                  <div className="member-avatar">{m.initials}</div>
                  <div className="member-info">
                    <p className="member-name">{m.name}</p>
                    <p className="member-email">{m.email}</p>
                  </div>
                  <select
                    defaultValue={m.role}
                    className="field-input"
                    style={{ width: "auto", padding: "8px 12px" }}
                  >
                    <option>Admin</option>
                    <option>Analyst</option>
                    <option>Viewer</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <div style={{ display: "grid", gap: 18 }}>
            {/* Auto-Approval Parameters */}
            <section className="page-panel">
              <div className="panel-heading">
                <div>
                  <h2 className="panel-title">Auto-Approval Parameters</h2>
                  <p className="panel-description">
                    New reports are automatically approved or rejected the moment analysis completes. Adjust the thresholds below.
                  </p>
                </div>
                <SlidersHorizontal size={18} color="var(--accent)" />
              </div>

              <form className="field-stack" onSubmit={handleSaveParams}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <label className="field-label">
                    Min. Overall Score
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      max={100}
                      value={approvalParams.minOverallScore}
                      onChange={(e) =>
                        setApprovalParams((p) => ({ ...p, minOverallScore: Number(e.target.value) }))
                      }
                    />
                    <span className="field-hint">Reports below this overall score are auto-rejected (0–100).</span>
                  </label>
                  <label className="field-label">
                    Min. Attribute Score
                    <input
                      className="field-input"
                      type="number"
                      min={0}
                      max={100}
                      value={approvalParams.minAttributeScore}
                      onChange={(e) =>
                        setApprovalParams((p) => ({ ...p, minAttributeScore: Number(e.target.value) }))
                      }
                    />
                    <span className="field-hint">Attributes scoring below this count as failures (0–100).</span>
                  </label>
                </div>
                <label className="field-label" style={{ maxWidth: 260 }}>
                  Max Failing Attributes Allowed
                  <input
                    className="field-input"
                    type="number"
                    min={0}
                    max={20}
                    value={approvalParams.maxFailingAttrs}
                    onChange={(e) =>
                      setApprovalParams((p) => ({ ...p, maxFailingAttrs: Number(e.target.value) }))
                    }
                  />
                  <span className="field-hint">Set to 0 to require all attributes to pass.</span>
                </label>

                <div className="params-current">
                  <p className="params-current-label">Current thresholds</p>
                  <div className="params-pills">
                    <span className="params-pill">Overall ≥ {approvalParams.minOverallScore}</span>
                    <span className="params-pill">Attribute ≥ {approvalParams.minAttributeScore}</span>
                    <span className="params-pill">Max failing: {approvalParams.maxFailingAttrs}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={
                      paramsSaved
                        ? { background: "var(--green-soft)", color: "var(--green)", border: "1px solid var(--green)" }
                        : {}
                    }
                  >
                    {paramsSaved ? "✓ Parameters saved" : "Save Parameters"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setApprovalParams({ ...DEFAULT_PARAMS })}
                  >
                    Reset to defaults
                  </button>
                </div>
              </form>
            </section>

            {/* 2FA */}
            <section className="page-panel">
              <div className="panel-heading">
                <div>
                  <h2 className="panel-title">Two-Factor Authentication</h2>
                  <p className="panel-description">
                    {twoFA
                      ? "Your account is protected with a second factor."
                      : "Add an extra layer of security to your sign-in."}
                  </p>
                </div>
              </div>
              <div className="toggle-wrap">
                <div>
                  <p className="toggle-label">Enable 2FA</p>
                  <p className="toggle-desc">Require a verification code at login.</p>
                </div>
                <button
                  type="button"
                  className="toggle-btn"
                  aria-checked={String(twoFA)}
                  onClick={() => setTwoFA((v) => !v)}
                >
                  <span className="toggle-knob" style={{ left: twoFA ? 23 : 3 }} />
                </button>
              </div>
            </section>

            {/* Audit log */}
            <section className="page-panel">
              <div className="panel-heading">
                <div>
                  <h2 className="panel-title">Recent Audit Log</h2>
                  <p className="panel-description">Platform activity by members and automated systems.</p>
                </div>
              </div>
              <div>
                {auditLog.map((entry, i) => (
                  <div key={i} className="log-row">
                    <span className="log-dot" style={{ background: entry.color }} />
                    <span className="log-action">{entry.action}</span>
                    <span className="log-meta">{entry.user} · {entry.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ── INTEGRATIONS TAB ── */}
      {activeTab === 2 && (
        <div className="settings-content-grid">
          {/* API Keys */}
          <section className="page-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">API Keys</h2>
                <p className="panel-description">
                  Generate keys to connect external pipelines and CI workflows to the fairness platform.
                </p>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: "0.88rem", padding: "8px 14px" }} onClick={handleGenerateKey}>
                <Plus size={14} /> New Key
              </button>
            </div>

            <div>
              {apiKeys.map((key) => (
                <div key={key.id} className="api-key-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="api-key-name">{key.name}</p>
                    <p className="api-key-value">{key.key}</p>
                  </div>
                  <span className="status-pill status-success" style={{ fontSize: "0.78rem" }}>Active</span>
                  <span style={{ color: "var(--muted)", fontSize: "0.83rem" }}>Since {key.created}</span>
                  <CopyButton text={key.key} />
                </div>
              ))}
            </div>
          </section>

          {/* Webhooks */}
          <section className="page-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Webhooks</h2>
                <p className="panel-description">
                  Receive real-time event notifications when analyses complete or models are flagged.
                </p>
              </div>
            </div>

            <form className="field-stack" onSubmit={handleWebhookTest}>
              <label className="field-label">
                Endpoint URL
                <input
                  className="field-input"
                  type="url"
                  placeholder="https://your-server.com/webhook"
                />
              </label>
              <label className="field-label">
                Secret Token
                <input
                  className="field-input"
                  type="password"
                  placeholder="Signing secret"
                />
              </label>
              <div>
                <p className="field-label" style={{ marginBottom: 10 }}>Trigger Events</p>
                <div className="checkbox-grid">
                  {["analysis.completed", "analysis.failed", "report.generated", "model.flagged"].map(
                    (event, i) => (
                      <label key={event} className="checkbox-card">
                        <input type="checkbox" defaultChecked={i < 2} />
                        <span>{event}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary">
                  {webhookTested ? "✓ Webhook Sent" : "Save & Test Webhook"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
