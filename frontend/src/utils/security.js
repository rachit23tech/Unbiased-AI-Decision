// ── Token generation ─────────────────────────────────────────────────────────

export function generateToken() {
  try {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    // Fallback (non-crypto environments)
    return Date.now().toString(36) + Math.random().toString(36).slice(2) +
           Math.random().toString(36).slice(2);
  }
}

// ── Password strength ────────────────────────────────────────────────────────

export const PASSWORD_RULES = {
  length:    { test: (p) => p.length >= 8,                           label: "At least 8 characters" },
  uppercase: { test: (p) => /[A-Z]/.test(p),                        label: "One uppercase letter" },
  lowercase: { test: (p) => /[a-z]/.test(p),                        label: "One lowercase letter" },
  number:    { test: (p) => /\d/.test(p),                           label: "One number" },
  special:   { test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p), label: "One special character" },
};

export function getPasswordStrength(password) {
  const results = {};
  let score = 0;
  for (const [key, rule] of Object.entries(PASSWORD_RULES)) {
    results[key] = rule.test(password);
    if (results[key]) score++;
  }
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["var(--red)", "var(--red)", "var(--amber)", "var(--amber)", "var(--green)"];
  return { score, results, label: labels[score] ?? "Strong", color: colors[score] ?? "var(--green)" };
}

export function isPasswordAcceptable(password) {
  const { results } = getPasswordStrength(password);
  return results.length && results.uppercase && results.lowercase && results.number;
}

// ── Input sanitization ───────────────────────────────────────────────────────

const ENTITIES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function sanitize(str) {
  return String(str).replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

// ── Login lockout ────────────────────────────────────────────────────────────

const LOCKOUT_KEY   = "auth_lockout";
export const MAX_ATTEMPTS  = 5;
export const LOCKOUT_MS    = 15 * 60 * 1000; // 15 minutes

function loadLockouts() {
  try { return JSON.parse(localStorage.getItem(LOCKOUT_KEY) || "{}"); }
  catch { return {}; }
}

function saveLockouts(data) {
  try { localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data)); }
  catch {}
}

export function getLockoutState(email) {
  const data = loadLockouts();
  const rec  = data[email.toLowerCase()];
  if (!rec) return { locked: false, count: 0, remainingSec: 0 };
  const now  = Date.now();
  if (rec.lockedUntil && rec.lockedUntil > now) {
    return { locked: true, count: rec.count, remainingSec: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  return { locked: false, count: rec.count ?? 0, remainingSec: 0 };
}

export function recordFailedAttempt(email) {
  const data = loadLockouts();
  const key  = email.toLowerCase();
  const now  = Date.now();
  const rec  = data[key] ?? { count: 0, lockedUntil: 0 };
  // Reset count if a previous lockout has expired
  if (rec.lockedUntil && rec.lockedUntil < now) rec.count = 0;
  rec.count += 1;
  rec.lockedUntil = rec.count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0;
  data[key] = rec;
  saveLockouts(data);
  return rec;
}

export function clearLockout(email) {
  const data = loadLockouts();
  delete data[email.toLowerCase()];
  saveLockouts(data);
}

// ── Session timing ───────────────────────────────────────────────────────────

export const SESSION_8H  = 8  * 60 * 60 * 1000;
export const SESSION_30D = 30 * 24 * 60 * 60 * 1000;
export const INACTIVITY_MS  = 30 * 60 * 1000; // auto-logout after 30 min idle
export const WARNING_MS     =  5 * 60 * 1000; // warn 5 min before logout
