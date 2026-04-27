import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Activity,
  Clock,
} from "lucide-react";
import useAuthStore from "../store/useAuthStore";
import { INACTIVITY_MS, WARNING_MS } from "../utils/security";
import NotificationBell from "./NotificationBell";

const ALL_NAV = [
  { to: "/dashboard",  label: "Dashboard",     icon: LayoutDashboard, roles: ["admin", "analyst", "viewer"] },
  { to: "/upload",     label: "Upload Models", icon: UploadCloud,     roles: ["admin", "analyst"] },
  { to: "/analysis",   label: "Analysis",      icon: BarChart3,       roles: ["admin", "analyst"] },
  { to: "/monitoring", label: "Monitoring",    icon: Activity,        roles: ["admin", "analyst"] },
  { to: "/reports",    label: "Reports",       icon: FileText,        roles: ["admin", "analyst", "viewer"] },
  { to: "/settings",   label: "Settings",      icon: Settings,        roles: ["admin"] },
];

const ROLE_LABEL = { admin: "Administrator", analyst: "Analyst", viewer: "Viewer" };

function InactivityWarning({ countdown, onStay, onLogout }) {
  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;
  return (
    <div className="inactivity-overlay">
      <div className="inactivity-modal">
        <div className="inactivity-icon">
          <Clock size={28} color="var(--amber)" />
        </div>
        <h3 className="inactivity-title">Are you still there?</h3>
        <p className="inactivity-desc">
          You'll be signed out automatically in{" "}
          <strong>
            {mins > 0 ? `${mins}m ` : ""}{String(secs).padStart(2, "0")}s
          </strong>{" "}
          due to inactivity.
        </p>
        <div className="inactivity-actions">
          <button className="btn btn-primary" onClick={onStay}>
            Stay signed in
          </button>
          <button className="btn btn-secondary" onClick={onLogout}>
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const navigate      = useNavigate();
  const user          = useAuthStore((s) => s.user);
  const role          = useAuthStore((s) => s.role);
  const clearSession  = useAuthStore((s) => s.clearSession);
  const checkExpiry   = useAuthStore((s) => s.checkExpiry);
  const refreshExpiry = useAuthStore((s) => s.refreshExpiry);

  const [showWarning,  setShowWarning]  = useState(false);
  const [countdown,    setCountdown]    = useState(0);

  const lastActivityRef = useRef(Date.now());
  const warningRef      = useRef(false);

  // ── Check session expiry on mount ─────────────────────────────────────────
  useEffect(() => {
    if (checkExpiry()) {
      navigate("/login", { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Inactivity watcher ────────────────────────────────────────────────────
  useEffect(() => {
    const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    function onActivity() {
      lastActivityRef.current = Date.now();
      if (warningRef.current) {
        warningRef.current = false;
        setShowWarning(false);
        refreshExpiry();
      }
    }

    EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));

    const tick = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;

      if (idle >= INACTIVITY_MS) {
        clearSession();
        navigate("/login", { replace: true, state: { reason: "inactivity" } });
        return;
      }

      if (idle >= INACTIVITY_MS - WARNING_MS && !warningRef.current) {
        warningRef.current = true;
        setShowWarning(true);
      }

      if (warningRef.current) {
        const remaining = Math.ceil((INACTIVITY_MS - idle) / 1000);
        setCountdown(remaining);
      }
    }, 1000);

    return () => {
      EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
      clearInterval(tick);
    };
  }, [clearSession, navigate, refreshExpiry]);

  // ── Derived values ────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const navItems = ALL_NAV.filter((item) => item.roles.includes(role));

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  function handleStay() {
    lastActivityRef.current = Date.now();
    warningRef.current = false;
    setShowWarning(false);
    refreshExpiry();
  }

  return (
    <>
      {showWarning && (
        <InactivityWarning
          countdown={countdown}
          onStay={handleStay}
          onLogout={handleLogout}
        />
      )}

      <div className="app-shell">
        <aside className="shell-sidebar">
          <div>
            {/* Brand */}
            <div className="brand-card">
              <p className="brand-kicker">Enterprise Platform</p>
              <h1 className="brand-title">Unbiased AI</h1>
              <p className="brand-subtitle">
                Governance and fairness review for enterprise AI systems.
              </p>
            </div>

            {/* Navigation — filtered by role */}
            <nav className="sidebar-nav" aria-label="Primary">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                >
                  <span className="nav-icon"><Icon size={18} /></span>
                  <span className="nav-label">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Profile + logout */}
          <div>
            <div className="sidebar-bottom-strip">
              <span className={"role-badge role-" + role}>{role ?? "guest"}</span>
              <NotificationBell />
            </div>

            <div className="profile-card">
              <div className="profile-avatar">{initials}</div>
              <div className="profile-meta">
                <p className="profile-name">{user?.name ?? "Guest"}</p>
                <p className="profile-role">{ROLE_LABEL[role] ?? role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", padding: 4, marginLeft: "auto", flexShrink: 0 }}
                aria-label="Sign out"
              >
                <LogOut size={18} color="var(--muted)" />
              </button>
            </div>
          </div>
        </aside>

        <main className="shell-main">
          <div className="main-inner">{children}</div>
        </main>
      </div>
    </>
  );
}
