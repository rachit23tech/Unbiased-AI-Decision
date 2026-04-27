import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import {
  getLockoutState,
  recordFailedAttempt,
  clearLockout,
  MAX_ATTEMPTS,
  sanitize,
} from "../utils/security";

const DEMO_ACCOUNTS = [
  { role: "admin",   name: "Jane Doe",     email: "admin@demo.com",   password: "Demo@1234", description: "Full access — all pages and settings" },
  { role: "analyst", name: "Marcus Kim",   email: "analyst@demo.com", password: "Demo@1234", description: "Upload, analyse, and view reports" },
  { role: "viewer",  name: "Priya Sharma", email: "viewer@demo.com",  password: "Demo@1234", description: "Read-only — dashboard and reports" },
];

function useCountdown(targetSec) {
  const [remaining, setRemaining] = useState(targetSec);
  useEffect(() => {
    setRemaining(targetSec);
    if (!targetSec) return;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [targetSec]);
  return remaining;
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const setSession = useAuthStore((s) => s.setSession);

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [remember,    setRemember]    = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState("");
  const [lockout,     setLockout]     = useState({ locked: false, count: 0, remainingSec: 0 });

  const destination = location.state?.from?.pathname ?? "/dashboard";

  // Re-check lockout state when email changes or countdown ticks
  const countdown = useCountdown(lockout.remainingSec);
  const emailRef  = useRef(email);
  emailRef.current = email;

  useEffect(() => {
    if (!email) return;
    const state = getLockoutState(email);
    setLockout(state);
  }, [email]);

  // Unlock when countdown hits zero
  useEffect(() => {
    if (lockout.locked && countdown === 0) {
      setLockout(getLockoutState(emailRef.current));
    }
  }, [countdown, lockout.locked]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Check lockout before any attempt
    const ls = getLockoutState(email);
    if (ls.locked) {
      setLockout(ls);
      return;
    }

    setIsLoading(true);

    // Try real backend
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${baseUrl}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: sanitize(email), password }),
      });
      if (res.ok) {
        const data = await res.json();
        clearLockout(email);
        setSession({
          user:     { name: data.name ?? email, email },
          token:    data.access_token,
          role:     data.role ?? "analyst",
          remember,
        });
        navigate(destination, { replace: true });
        return;
      }
    } catch {
      // Backend unavailable — fall through to demo auth
    }

    // Demo authentication
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email.toLowerCase() && a.password === password,
    );

    if (account) {
      clearLockout(email);
      setSession({
        user:     { name: account.name, email: account.email },
        token:    null, // generateToken() called inside setSession
        role:     account.role,
        remember,
      });
      navigate(destination, { replace: true });
    } else {
      const rec = recordFailedAttempt(email);
      const remaining = MAX_ATTEMPTS - rec.count;

      if (rec.count >= MAX_ATTEMPTS) {
        setLockout(getLockoutState(email));
        setError("");
      } else {
        setError(
          remaining === 1
            ? "Incorrect credentials. 1 attempt remaining before your account is locked."
            : `Incorrect credentials. ${remaining} attempts remaining.`,
        );
      }
      setIsLoading(false);
    }
  }

  function fillDemo(account) {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
    setLockout({ locked: false, count: 0, remainingSec: 0 });
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="section-kicker">Access Portal</p>
        <h2>Sign in</h2>
        <p>Access the fairness dashboard and governance reporting workspace.</p>

        {/* Lockout banner */}
        {lockout.locked && (
          <div className="lockout-banner">
            <Lock size={16} />
            <div>
              <p className="lockout-title">Account temporarily locked</p>
              <p className="lockout-desc">
                Too many failed attempts. Try again in{" "}
                <strong>{formatTime(countdown)}</strong>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              disabled={lockout.locked}
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
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={lockout.locked}
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
          </label>

          {/* Remember me */}
          <label className="remember-row">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me for 30 days</span>
          </label>

          {/* Attempt warning */}
          {!lockout.locked && lockout.count > 0 && !error && (
            <div className="attempts-warning">
              <AlertTriangle size={14} />
              {MAX_ATTEMPTS - lockout.count} attempt{MAX_ATTEMPTS - lockout.count !== 1 ? "s" : ""} remaining before lockout
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={isLoading || lockout.locked}
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="link-row">
          Need an account? <Link to="/register">Create one</Link>
        </p>

        {/* Demo credentials */}
        <div className="auth-demo">
          <p className="auth-demo-title">Demo accounts · password: Demo@1234</p>
          {DEMO_ACCOUNTS.map((account) => (
            <div key={account.role} className="auth-demo-row">
              <div className="auth-demo-left">
                <p className="auth-demo-role">
                  {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                  {" "}— {account.description}
                </p>
                <p className="auth-demo-cred">{account.email}</p>
              </div>
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => fillDemo(account)}
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
