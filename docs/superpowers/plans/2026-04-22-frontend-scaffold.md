# Frontend Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable `Vite + React` frontend scaffold for Unbiased AI Decision with route shells, starter components, API/store placeholders, and test setup.

**Architecture:** The frontend will live under `frontend/` as an isolated Vite app. Routing will be handled with `react-router-dom`, shared UI will live in `src/components`, route screens in `src/pages`, and starter integration points in `src/api`, `src/store`, and `src/utils`.

**Tech Stack:** React 18, Vite, react-router-dom, Axios, Zustand, Vitest, Testing Library

---

### Task 1: Create Frontend Project Shell

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/.gitignore`

- [ ] **Step 1: Write the failing setup expectation**

Document the expected install/run commands:

```bash
cd frontend
npm install
npm run dev
```

Expected before implementation: the `frontend/` directory and config files do not exist.

- [ ] **Step 2: Create `frontend/package.json`**

```json
{
  "name": "unbiased-ai-decision-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "axios": "^1.9.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.30.1",
    "zustand": "^5.0.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@vitejs/plugin-react": "^4.4.1",
    "jsdom": "^26.1.0",
    "vite": "^6.3.5",
    "vitest": "^3.1.2"
  }
}
```

- [ ] **Step 3: Create `frontend/vite.config.js`**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
    globals: true,
  },
});
```

- [ ] **Step 4: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Unbiased AI Decision</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `frontend/.gitignore`**

```gitignore
node_modules
dist
.vite
coverage
```

- [ ] **Step 6: Verify project files exist**

Run: `Get-ChildItem frontend`

Expected: `package.json`, `vite.config.js`, `index.html`, and `.gitignore` are listed.

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/vite.config.js frontend/index.html frontend/.gitignore
git commit -m "chore: add frontend vite shell"
```

**Beginner Version**

What this part is:
This is the "project boot" layer. These files do not build your UI yet. They tell the computer how to run your frontend app.

What to understand first:
- `package.json` lists dependencies and scripts
- `vite.config.js` configures Vite
- `index.html` gives React a root element to render into
- `.gitignore` tells git which generated files to ignore

What to type first if you want the simplest start:
- create `package.json`
- create `index.html`
- leave the rest as small config files

What you can ignore for now:
- exact dependency versions
- advanced Vite settings
- testing config details

Small mental model:
`index.html` creates `<div id="root"></div>` and React later fills that box with your app.

### Task 2: Add App Entry and Global Styles

**Files:**
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/styles.css`

- [ ] **Step 1: Write the failing app render test expectation**

The app entry should render a router-backed React tree into `#root` and load global styles. Before implementation, `src/` does not exist.

- [ ] **Step 2: Create `frontend/src/main.jsx`**

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

- [ ] **Step 3: Create `frontend/src/styles.css`**

```css
:root {
  color-scheme: light;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f4f7fb;
  color: #122033;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(39, 110, 241, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(35, 165, 144, 0.12), transparent 25%),
    #f4f7fb;
  color: #122033;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select {
  font: inherit;
}

#root {
  min-height: 100vh;
}

.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px 1fr;
}

.sidebar {
  background: #0f1d34;
  color: #f8fbff;
  padding: 24px;
}

.sidebar h1 {
  margin: 0 0 8px;
  font-size: 1.35rem;
}

.sidebar p {
  margin: 0 0 24px;
  color: rgba(248, 251, 255, 0.72);
  line-height: 1.5;
}

.nav-list {
  display: grid;
  gap: 10px;
}

.nav-link {
  display: block;
  padding: 12px 14px;
  border-radius: 14px;
  color: rgba(248, 251, 255, 0.88);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.main-panel {
  padding: 28px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.page-header p {
  margin: 0;
  color: #5d6b80;
  max-width: 780px;
  line-height: 1.6;
}

.page-grid {
  display: grid;
  gap: 18px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

.card,
.placeholder-chart,
.banner,
.auth-card,
.table-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(18, 32, 51, 0.08);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 18px 45px rgba(15, 29, 52, 0.06);
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 10px 0 0;
}

.muted {
  color: #627084;
}

.banner {
  border-left: 6px solid #f59e0b;
}

.banner.high {
  border-left-color: #d14343;
}

.banner.low {
  border-left-color: #1c9c73;
}

.placeholder-chart {
  min-height: 220px;
  display: grid;
  align-items: center;
}

.placeholder-chart strong {
  display: block;
  margin-bottom: 8px;
}

.table-card ul,
.sidebar ul {
  margin: 0;
  padding-left: 18px;
}

.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(100%, 460px);
}

.auth-card form {
  display: grid;
  gap: 14px;
  margin-top: 16px;
}

.auth-card label {
  display: grid;
  gap: 6px;
  color: #314055;
}

.auth-card input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #ccd6e4;
  background: #ffffff;
}

.primary-button {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  background: #276ef1;
  color: #ffffff;
  cursor: pointer;
  font-weight: 600;
}

.link-row {
  margin-top: 16px;
  color: #5d6b80;
}

.not-found {
  display: grid;
  gap: 16px;
  place-items: start;
}

@media (max-width: 860px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    padding-bottom: 12px;
  }

  .main-panel {
    padding: 20px;
  }
}
```

- [ ] **Step 4: Create `frontend/src/App.jsx`**

```jsx
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";

function AppLayout() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Verify the app entry files are present**

Run: `Get-ChildItem frontend\\src`

Expected: `main.jsx`, `App.jsx`, and `styles.css` appear.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/main.jsx frontend/src/App.jsx frontend/src/styles.css
git commit -m "feat: add frontend app entry and styles"
```

**Beginner Version**

What this part is:
This is where React starts. Think of it as the front door of your app.

What each file does:
- `main.jsx` starts React
- `App.jsx` is your main top-level component
- `styles.css` adds global styling

What to write first:
- in `main.jsx`, render `<App />`
- in `App.jsx`, return one `<h1>`
- in `styles.css`, only add a `body` background and font

Smallest possible version:

```jsx
// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

```jsx
// App.jsx
export default function App() {
  return <h1>Hello frontend</h1>;
}
```

What you can ignore for now:
- routing
- layout systems
- polished CSS
- strict mode details

### Task 3: Add Shared Layout and Reusable Components

**Files:**
- Create: `frontend/src/components/AppShell.jsx`
- Create: `frontend/src/components/PageHeader.jsx`
- Create: `frontend/src/components/BiasScoreCard.jsx`
- Create: `frontend/src/components/MetricChart.jsx`
- Create: `frontend/src/components/ShapChart.jsx`
- Create: `frontend/src/components/FlagBanner.jsx`

- [ ] **Step 1: Write the failing component contract**

The scaffold needs reusable shared UI so pages do not duplicate layout and placeholder rendering logic.

- [ ] **Step 2: Create `frontend/src/components/AppShell.jsx`**

```jsx
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/analysis", label: "Analysis" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" },
];

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Unbiased AI</h1>
        <p>
          Prototype workspace for fairness analysis, explainability, and audit
          reporting.
        </p>
        <nav className="nav-list" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-panel">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/components/PageHeader.jsx`**

```jsx
export default function PageHeader({ title, description }) {
  return (
    <header className="page-header">
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
```

- [ ] **Step 4: Create `frontend/src/components/BiasScoreCard.jsx`**

```jsx
export default function BiasScoreCard({ label, value, tone = "neutral" }) {
  return (
    <section className="card">
      <p className="muted">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="muted">
        {tone === "positive"
          ? "Fairness indicators are trending healthy."
          : tone === "warning"
            ? "Some fairness metrics need review."
            : "Use this panel as a starter placeholder."}
      </p>
    </section>
  );
}
```

- [ ] **Step 5: Create `frontend/src/components/MetricChart.jsx`**

```jsx
export default function MetricChart() {
  return (
    <section className="placeholder-chart">
      <div>
        <strong>Metric Chart Placeholder</strong>
        <p className="muted">
          This space is reserved for fairness metric visualizations such as
          demographic parity and equalized odds.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `frontend/src/components/ShapChart.jsx`**

```jsx
export default function ShapChart() {
  return (
    <section className="placeholder-chart">
      <div>
        <strong>SHAP Explainability Placeholder</strong>
        <p className="muted">
          Future iterations will render feature importance bars and sensitive
          attribute warnings here.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `frontend/src/components/FlagBanner.jsx`**

```jsx
export default function FlagBanner({ title, message, severity = "medium" }) {
  const severityClass =
    severity === "high" ? "banner high" : severity === "low" ? "banner low" : "banner";

  return (
    <section className={severityClass}>
      <strong>{title}</strong>
      <p className="muted">{message}</p>
    </section>
  );
}
```

- [ ] **Step 8: Verify component files exist**

Run: `Get-ChildItem frontend\\src\\components`

Expected: the six component files are listed.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components
git commit -m "feat: add shared frontend starter components"
```

**Beginner Version**

What this part is:
Components are reusable UI pieces. Instead of rewriting the same block many times, you make a small function and reuse it.

What to understand first:
- a component is just a function that returns JSX
- props are values passed into a component
- reusable components keep pages cleaner

What to build first:
- `PageHeader`
- then `BiasScoreCard`
- leave chart components as plain placeholder text at first

Small beginner examples:

```jsx
// PageHeader.jsx
export default function PageHeader({ title }) {
  return <h2>{title}</h2>;
}
```

```jsx
// BiasScoreCard.jsx
export default function BiasScoreCard({ label, value }) {
  return (
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
```

What you can ignore for now:
- fancy layout wrappers
- conditional class names
- navigation highlighting
- chart libraries

How to think about it:
If you copy-paste the same UI twice, that is a sign it can become a component.

### Task 4: Add Route-Level Pages

**Files:**
- Create: `frontend/src/pages/Dashboard.jsx`
- Create: `frontend/src/pages/Upload.jsx`
- Create: `frontend/src/pages/Analysis.jsx`
- Create: `frontend/src/pages/Reports.jsx`
- Create: `frontend/src/pages/Settings.jsx`
- Create: `frontend/src/pages/Login.jsx`
- Create: `frontend/src/pages/Register.jsx`
- Create: `frontend/src/pages/NotFound.jsx`

- [ ] **Step 1: Write the failing route expectation**

The scaffold must expose meaningful page shells for all planned routes so the app is demoable immediately after install.

- [ ] **Step 2: Create `frontend/src/pages/Dashboard.jsx`**

```jsx
import BiasScoreCard from "../components/BiasScoreCard";
import FlagBanner from "../components/FlagBanner";
import MetricChart from "../components/MetricChart";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Fairness Dashboard"
        description="Track analysis volume, bias score health, and flagged model risk from one overview screen."
      />
      <div className="card-grid">
        <BiasScoreCard label="Total Analyses" value="12" />
        <BiasScoreCard label="Average Bias Score" value="78" tone="warning" />
        <BiasScoreCard label="Flagged Models" value="3" tone="warning" />
      </div>
      <FlagBanner
        title="Prototype Insight"
        message="Two recent analyses crossed the medium-risk threshold and should be reviewed before deployment."
        severity="medium"
      />
      <MetricChart />
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/pages/Upload.jsx`**

```jsx
import PageHeader from "../components/PageHeader";

export default function Upload() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Upload Dataset"
        description="Bring in CSV or JSON files, preview structure, and prepare fairness analysis inputs."
      />
      <section className="card">
        <strong>Drag-and-drop upload placeholder</strong>
        <p className="muted">
          This panel will become the dataset and model upload workflow with
          validation, progress feedback, and preview data.
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Create `frontend/src/pages/Analysis.jsx`**

```jsx
import FlagBanner from "../components/FlagBanner";
import MetricChart from "../components/MetricChart";
import PageHeader from "../components/PageHeader";
import ShapChart from "../components/ShapChart";

export default function Analysis() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Analysis Results"
        description="Inspect fairness metrics, severity indicators, and explainability outputs for a completed analysis job."
      />
      <FlagBanner
        title="Sensitive Attribute Warning"
        message="Gender appears among the most influential predictors in this placeholder analysis."
        severity="high"
      />
      <MetricChart />
      <ShapChart />
    </div>
  );
}
```

- [ ] **Step 5: Create `frontend/src/pages/Reports.jsx`**

```jsx
import PageHeader from "../components/PageHeader";

export default function Reports() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Reports"
        description="Review generated audits, status badges, and future PDF download actions."
      />
      <section className="table-card">
        <strong>Report Queue Placeholder</strong>
        <ul>
          <li>Hiring model fairness audit - Medium Risk</li>
          <li>Loan approval model audit - High Risk</li>
          <li>Claims triage dataset audit - Low Risk</li>
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Create `frontend/src/pages/Settings.jsx`**

```jsx
import PageHeader from "../components/PageHeader";

export default function Settings() {
  return (
    <div className="page-grid">
      <PageHeader
        title="Settings and Audit Log"
        description="Manage account details, roles, and traceability features in future iterations."
      />
      <section className="table-card">
        <strong>Starter Areas</strong>
        <ul>
          <li>User profile and role badge</li>
          <li>Audit trail viewer</li>
          <li>Environment and API connection settings</li>
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 7: Create `frontend/src/pages/Login.jsx`**

```jsx
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <h2>Welcome back</h2>
        <p className="muted">
          Sign in to review fairness analyses and audit reports.
        </p>
        <form>
          <label>
            Email
            <input type="email" placeholder="team@unbiased.ai" />
          </label>
          <label>
            Password
            <input type="password" placeholder="••••••••" />
          </label>
          <button type="button" className="primary-button">
            Sign In
          </button>
        </form>
        <p className="link-row">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 8: Create `frontend/src/pages/Register.jsx`**

```jsx
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div className="auth-page">
      <section className="auth-card">
        <h2>Create account</h2>
        <p className="muted">
          Start auditing datasets and models for fairness risk.
        </p>
        <form>
          <label>
            Full Name
            <input type="text" placeholder="Avery Chen" />
          </label>
          <label>
            Email
            <input type="email" placeholder="avery@unbiased.ai" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Create a password" />
          </label>
          <button type="button" className="primary-button">
            Register
          </button>
        </form>
        <p className="link-row">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
```

- [ ] **Step 9: Create `frontend/src/pages/NotFound.jsx`**

```jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h2>Page not found</h2>
      <p className="muted">
        The route you requested is not part of the current prototype scaffold.
      </p>
      <Link to="/dashboard" className="primary-button">
        Back to dashboard
      </Link>
    </div>
  );
}
```

- [ ] **Step 10: Verify page files exist**

Run: `Get-ChildItem frontend\\src\\pages`

Expected: the eight page files are listed.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/pages
git commit -m "feat: add frontend route shells"
```

**Beginner Version**

What this part is:
Pages are the big screens of your app, like Dashboard, Login, Upload, and Reports.

What to understand first:
- one file usually equals one screen
- a page can start as plain text
- later, pages import components to become richer

Best beginner order:
1. `Dashboard.jsx`
2. `Login.jsx`
3. `Upload.jsx`
4. the rest after that

Smallest possible page:

```jsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This is the dashboard page.</p>
    </div>
  );
}
```

Then level it up a little:

```jsx
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" />
      <p>This is the dashboard page.</p>
    </div>
  );
}
```

What you can ignore for now:
- full dummy data
- realistic charts
- polished forms
- error states

Good learning habit:
Make each page render something visible before making it look good.

### Task 5: Add API, Store, and Utility Starter Modules

**Files:**
- Create: `frontend/src/api/client.js`
- Create: `frontend/src/api/analysis.js`
- Create: `frontend/src/store/useAuthStore.js`
- Create: `frontend/src/store/useAnalysisStore.js`
- Create: `frontend/src/utils/constants.js`
- Create: `frontend/src/utils/formatters.js`

- [ ] **Step 1: Write the failing integration module expectation**

The scaffold needs stable entry points for future API, global state, and formatting logic so new features can plug in without restructuring.

- [ ] **Step 2: Create `frontend/src/api/client.js`**

```js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
```

- [ ] **Step 3: Create `frontend/src/api/analysis.js`**

```js
import client from "./client";

export async function fetchAnalysisResults(jobId) {
  if (!jobId) {
    return { data: null, message: "No job selected yet." };
  }

  const response = await client.get(`/jobs/${jobId}/results`);
  return response.data;
}
```

- [ ] **Step 4: Create `frontend/src/store/useAuthStore.js`**

```js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  setSession: ({ user, token }) => set({ user, token }),
  clearSession: () => set({ user: null, token: null }),
}));

export default useAuthStore;
```

- [ ] **Step 5: Create `frontend/src/store/useAnalysisStore.js`**

```js
import { create } from "zustand";

const useAnalysisStore = create((set) => ({
  selectedDatasetId: null,
  selectedJobId: null,
  setSelectedDatasetId: (selectedDatasetId) => set({ selectedDatasetId }),
  setSelectedJobId: (selectedJobId) => set({ selectedJobId }),
}));

export default useAnalysisStore;
```

- [ ] **Step 6: Create `frontend/src/utils/constants.js`**

```js
export const riskBands = [
  { label: "Low Risk", min: 80, max: 100 },
  { label: "Medium Risk", min: 50, max: 79 },
  { label: "High Risk", min: 0, max: 49 },
];

export const supportedFileTypes = [".csv", ".json"];
```

- [ ] **Step 7: Create `frontend/src/utils/formatters.js`**

```js
export function formatPercent(value) {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value.toFixed(1)}%`;
}

export function formatRiskLabel(score) {
  if (typeof score !== "number") {
    return "Unknown";
  }

  if (score >= 80) {
    return "Low Risk";
  }

  if (score >= 50) {
    return "Medium Risk";
  }

  return "High Risk";
}
```

- [ ] **Step 8: Verify module folders exist**

Run: `Get-ChildItem frontend\\src\\api; Get-ChildItem frontend\\src\\store; Get-ChildItem frontend\\src\\utils`

Expected: the created starter modules are listed under each folder.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/api frontend/src/store frontend/src/utils
git commit -m "feat: add frontend integration starter modules"
```

**Beginner Version**

What this part is:
These files are helpers. They are not the UI itself. They support the UI.

What each area means:
- `api/` talks to the backend
- `store/` keeps shared state
- `utils/` holds helper functions

What to build first:
- keep `api/client.js` very small
- keep `utils/formatters.js` very small
- leave `store/` mostly empty if state is still confusing

Small beginner examples:

```js
// api/client.js
export const apiBaseUrl = "http://localhost:8000/api/v1";
```

```js
// utils/formatters.js
export function formatPercent(value) {
  return `${value}%`;
}
```

What you can ignore for now:
- Zustand details
- Axios instances
- real API calls
- environment variables

How to think about it:
If a piece of logic is not UI, it probably belongs in `api`, `store`, or `utils`.

### Task 6: Add Test Setup and Smoke Test

**Files:**
- Create: `frontend/tests/setup.js`
- Create: `frontend/tests/app.test.jsx`

- [ ] **Step 1: Write the failing smoke test**

```jsx
import { render, screen } from "@testing-library/react";

test("renders dashboard content", () => {
  render(null);
  expect(screen.getByText(/Fairness Dashboard/i)).toBeInTheDocument();
});
```

Expected: FAIL because the real app test setup is not implemented yet.

- [ ] **Step 2: Create `frontend/tests/setup.js`**

```js
import "@testing-library/jest-dom";
```

- [ ] **Step 3: Create `frontend/tests/app.test.jsx`**

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

test("renders dashboard content", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/Fairness Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Average Bias Score/i)).toBeInTheDocument();
});
```

- [ ] **Step 4: Run the smoke test**

Run: `cd frontend && npm test`

Expected: PASS with one successful test after dependencies are installed.

- [ ] **Step 5: Commit**

```bash
git add frontend/tests
git commit -m "test: add frontend smoke test setup"
```

**Beginner Version**

What this part is:
Tests check whether your code still works after changes.

What a smoke test means:
A smoke test is a very basic test that asks, "Does the app render at all?"

Best beginner mindset:
- write one tiny test
- make it pass
- stop there for now

Simple example:

```jsx
import { render, screen } from "@testing-library/react";
import App from "../src/App";

test("shows app heading", () => {
  render(<App />);
  expect(screen.getByText(/Unbiased AI Decision/i)).toBeInTheDocument();
});
```

What you can ignore for now:
- advanced mocking
- route testing
- coverage numbers
- testing every component

Important mindset:
You do not need to become a testing expert on day one. Start with one test that proves the page renders.

### Task 7: Install Dependencies and Verify the Scaffold

**Files:**
- Modify: `frontend/package.json`
- Verify: `frontend/`

- [ ] **Step 1: Install frontend dependencies**

Run: `cd frontend && npm install`

Expected: `node_modules` and lockfile are created successfully.

- [ ] **Step 2: Start the dev server**

Run: `cd frontend && npm run dev`

Expected: Vite starts successfully and serves the app locally.

- [ ] **Step 3: Build the app**

Run: `cd frontend && npm run build`

Expected: a production build completes without errors.

- [ ] **Step 4: Run tests**

Run: `cd frontend && npm test`

Expected: the smoke test passes.

- [ ] **Step 5: Commit**

```bash
git add frontend/package-lock.json
git commit -m "chore: verify frontend scaffold"
```

**Beginner Version**

What this part is:
This is the "did my setup actually work?" stage.

What each command tells you:
- `npm install` downloads packages
- `npm run dev` starts the development server
- `npm run build` checks production build readiness
- `npm test` runs your tests

What to do first as a beginner:
1. run `npm install`
2. run `npm run dev`
3. open the app in the browser
4. only after that, try build and tests

What to do if something breaks:
- read the first error line, not the whole wall of text
- check which file the error points to
- fix one issue at a time

Beginner rule:
If the app renders in the browser, that is already real progress.

## Self-Review

- Spec coverage: covered project shell, routing, components, pages, API/store/utils, and test scaffolding from the design spec.
- Placeholder scan: no `TBD` or unresolved implementation markers remain in the plan steps.
- Type consistency: route names, file paths, and module names match consistently across tasks.

## Beginner Learning Path

If you want to learn while building, use this order instead of trying to understand everything at once:

1. Make `App.jsx` render one heading.
2. Make one page like `Dashboard.jsx` render simple text.
3. Import one component like `PageHeader`.
4. Add routing after you are comfortable with components.
5. Add one helper function in `utils`.
6. Add one API file only when you actually need backend data.
7. Add one test after the UI is visible in the browser.

## Beginner Rule Of Thumb

- If a file feels confusing, shrink it.
- If a component feels complicated, remove props until it makes sense.
- If a page feels overwhelming, render plain text first.
- If an error looks scary, read the first useful line and fix only that.
- If you get stuck, ask: "What is the smallest version of this that can work?"
