import { create } from "zustand";
import { generateToken, SESSION_8H, SESSION_30D } from "../utils/security";

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadSession() {
  try {
    const raw =
      sessionStorage.getItem("auth_session") ||
      localStorage.getItem("auth_session") ||
      "null";
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isValid(session) {
  return (
    session &&
    session.user &&
    session.token &&
    session.role &&
    session.expiresAt &&
    session.expiresAt > Date.now()
  );
}

const saved = loadSession();
const initial = isValid(saved) ? saved : null;

// Clear stale session if it failed validation
if (saved && !isValid(saved)) {
  localStorage.removeItem("auth_session");
  sessionStorage.removeItem("auth_session");
}

// ── Store ────────────────────────────────────────────────────────────────────

const useAuthStore = create((set, get) => ({
  user:      initial?.user      ?? null,
  token:     initial?.token     ?? null,
  role:      initial?.role      ?? null,
  expiresAt: initial?.expiresAt ?? null,

  setSession({ user, token, role, remember = false }) {
    // Always generate a strong token for demo sessions; real sessions use the
    // server-issued JWT passed in via `token`.
    const secureToken = token || generateToken();
    const expiresAt   = Date.now() + (remember ? SESSION_30D : SESSION_8H);
    const session     = { user, token: secureToken, role, expiresAt };

    // Persist to the appropriate storage based on remember-me
    const target = remember ? localStorage : sessionStorage;
    const other  = remember ? sessionStorage : localStorage;
    target.setItem("auth_session", JSON.stringify(session));
    other.removeItem("auth_session");

    set({ user, token: secureToken, role, expiresAt });
  },

  clearSession() {
    localStorage.removeItem("auth_session");
    sessionStorage.removeItem("auth_session");
    set({ user: null, token: null, role: null, expiresAt: null });
  },

  refreshExpiry() {
    // Called by inactivity watcher to extend session on user activity
    const { expiresAt } = get();
    if (!expiresAt) return;
    const session = loadSession();
    if (!session) return;
    const extended = { ...session, expiresAt: Date.now() + SESSION_8H };
    const inLocal  = !!localStorage.getItem("auth_session");
    (inLocal ? localStorage : sessionStorage).setItem(
      "auth_session",
      JSON.stringify(extended),
    );
    set({ expiresAt: extended.expiresAt });
  },

  checkExpiry() {
    const { expiresAt, clearSession } = get();
    if (expiresAt && Date.now() > expiresAt) {
      clearSession();
      return true; // expired
    }
    return false;
  },
}));

export default useAuthStore;
