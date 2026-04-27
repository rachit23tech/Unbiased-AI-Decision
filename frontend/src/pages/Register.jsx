import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check, X } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import {
  getPasswordStrength,
  isPasswordAcceptable,
  PASSWORD_RULES,
  sanitize,
} from "../utils/security";

// Admin accounts are created by invite only — self-registration is restricted
// to Analyst and Viewer roles.
const ROLES = [
  { id: "analyst", name: "Analyst", desc: "Upload models, run analyses, and generate reports." },
  { id: "viewer",  name: "Viewer",  desc: "Read-only access to the dashboard and audit reports." },
];

function StrengthMeter({ password }) {
  const { score, results, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="strength-meter">
      <div className="strength-track">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="strength-segment"
            style={{ background: i < score ? color : "var(--line)" }}
          />
        ))}
      </div>
      <p className="strength-label" style={{ color }}>{label}</p>

      <div className="strength-checks">
        {Object.entries(PASSWORD_RULES).map(([key, rule]) => (
          <div key={key} className={`strength-check ${results[key] ? "pass" : "fail"}`}>
            {results[key] ? <Check size={11} /> : <X size={11} />}
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const navigate   = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [selectedRole, setSelectedRole] = useState("analyst");
  const [isLoading,    setIsLoading]    = useState(false);
  const [error,        setError]        = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // ── Client-side validation ──────────────────────────────────────────────
    if (!isPasswordAcceptable(password)) {
      setError("Password must be at least 8 characters and include an uppercase letter, lowercase letter, and number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    // Try real backend
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:  sanitize(name),
          email: sanitize(email),
          password,
          role:  selectedRole, // server should validate/override this
        }),
      });
      if (res.ok) {
        setSession({ user: { name, email }, token: null, role: selectedRole });
        navigate("/dashboard", { replace: true });
        return;
      }
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail ?? "Registration failed. Please try again.");
    } catch (err) {
      if (err.message && !err.message.includes("fetch")) {
        setError(err.message);
        setIsLoading(false);
        return;
      }
    }

    // Demo fallback — mock registration
    setSession({ user: { name, email }, token: null, role: selectedRole });
    navigate("/dashboard", { replace: true });
  }

  const passwordsMatch = confirm && password === confirm;
  const passwordMismatch = confirm && password !== confirm;

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="section-kicker">Access Portal</p>
        <h2>Create account</h2>
        <p>Set up a workspace account to begin fairness reviews and audit reporting.</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label">
            Full name
            <input
              className="field-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
          </label>

          <label className="field-label">
            Email address
            <input
              className="field-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field-label">
            Password
            <div className="pwd-input-wrap">
              <input
                className="field-input pwd-input"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                tabIndex={-1}
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <StrengthMeter password={password} />
          </label>

          <label className="field-label">
            Confirm password
            <div className="pwd-input-wrap">
              <input
                className={`field-input pwd-input ${passwordMismatch ? "input-error" : ""} ${passwordsMatch ? "input-success" : ""}`}
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="pwd-toggle"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordMismatch && <p className="field-error">Passwords do not match.</p>}
            {passwordsMatch   && <p className="field-ok">Passwords match.</p>}
          </label>

          {/* Role picker — admin excluded from self-registration */}
          <div>
            <p className="field-label" style={{ marginBottom: 0 }}>Access role</p>
            <div className="role-grid">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  className={"role-option" + (selectedRole === role.id ? " selected" : "")}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <span className="role-option-name">{role.name}</span>
                  <span className="role-option-desc">{role.desc}</span>
                </button>
              ))}
            </div>
            <p className="field-hint" style={{ marginTop: 8 }}>
              Admin accounts are provisioned by invitation only.
            </p>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading || passwordMismatch || !password}
          >
            {isLoading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="link-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
