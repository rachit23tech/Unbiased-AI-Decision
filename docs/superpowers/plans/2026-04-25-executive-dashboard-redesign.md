# Executive Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the frontend styling pipeline and redesign the shared shell plus dashboard into a modern, high-trust executive experience.

**Architecture:** First restore reliable styling by replacing the broken Tailwind setup with stable global CSS tokens and component classes that work in the current repo without additional package churn. Then rebuild the dashboard and app shell around a light executive layout, updating shared components so the new system is reusable across the app.

**Tech Stack:** React 18, Vite, CSS, Framer Motion, Recharts, Vitest, Testing Library

---

### Task 1: Restore the Styling Foundation

**Files:**
- Modify: `frontend/src/styles.css`
- Verify: `frontend/package.json`

- [ ] **Step 1: Write the failing test**

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";

test("renders executive dashboard shell text", () => {
  render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByText(/fairness command center/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app.test.jsx`
Expected: FAIL because the current dashboard does not render the new executive copy yet.

- [ ] **Step 3: Replace Tailwind directives with working global CSS**

```css
:root {
  --bg: #f3f5f8;
  --panel: #ffffff;
  --panel-alt: #f8fafc;
  --text: #102033;
  --muted: #5f6f82;
  --line: #d9e1ea;
  --line-strong: #c9d4df;
  --navy: #17324d;
  --navy-soft: #23476b;
  --teal: #0f766e;
  --teal-soft: #d8f1ee;
  --amber: #b7791f;
  --amber-soft: #fff3db;
  --red: #b54747;
  --red-soft: #fde8e8;
  --green: #2f855a;
  --green-soft: #e4f5ea;
  --shadow-sm: 0 10px 30px rgba(16, 32, 51, 0.06);
  --shadow-md: 0 24px 60px rgba(16, 32, 51, 0.08);
  --radius-lg: 24px;
  --radius-md: 18px;
  --radius-sm: 12px;
}
```

- [ ] **Step 4: Run test to verify it still fails for the right reason**

Run: `npm test -- --run tests/app.test.jsx`
Expected: FAIL because the new copy still is not implemented, not because CSS parsing is broken.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles.css
git commit -m "fix: restore frontend styling foundation"
```

### Task 2: Rebuild the Shared Shell

**Files:**
- Modify: `frontend/src/components/AppShell.jsx`
- Modify: `frontend/src/components/PageHeader.jsx`

- [ ] **Step 1: Write the failing shell expectation**

```jsx
expect(screen.getByText(/executive oversight/i)).toBeInTheDocument();
expect(screen.getByText(/governance summary/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app.test.jsx`
Expected: FAIL because the old shell content is still present.

- [ ] **Step 3: Implement the executive shell**

```jsx
<aside>
  <p>Executive Oversight</p>
  <h1>Unbiased AI</h1>
  <p>Governance Summary</p>
</aside>
```

- [ ] **Step 4: Run test to verify shell copy passes**

Run: `npm test -- --run tests/app.test.jsx`
Expected: PASS for the shell expectations or move to the next failing dashboard assertion.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/AppShell.jsx frontend/src/components/PageHeader.jsx
git commit -m "feat: redesign executive app shell"
```

### Task 3: Redesign Shared Dashboard Components

**Files:**
- Modify: `frontend/src/components/BiasScoreCard.jsx`
- Modify: `frontend/src/components/FlagBanner.jsx`
- Modify: `frontend/src/components/MetricChart.jsx`

- [ ] **Step 1: Write the failing component expectations**

```jsx
expect(screen.getByText(/compliance rate/i)).toBeInTheDocument();
expect(screen.getByText(/models needing review/i)).toBeInTheDocument();
expect(screen.getByText(/portfolio fairness trend/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app.test.jsx`
Expected: FAIL because the old cards and chart titles are still rendered.

- [ ] **Step 3: Implement executive card, alert, and chart styling**

```jsx
<section className="metric-card executive-card">...</section>
<section className="priority-banner">...</section>
<section className="chart-panel">...</section>
```

- [ ] **Step 4: Run test to verify component text passes**

Run: `npm test -- --run tests/app.test.jsx`
Expected: PASS for updated component copy.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/BiasScoreCard.jsx frontend/src/components/FlagBanner.jsx frontend/src/components/MetricChart.jsx
git commit -m "feat: redesign shared executive dashboard components"
```

### Task 4: Rebuild the Dashboard Layout

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`
- Create: `frontend/src/components/RiskTable.jsx`

- [ ] **Step 1: Write the failing dashboard expectations**

```jsx
expect(screen.getByText(/fairness command center/i)).toBeInTheDocument();
expect(screen.getByText(/flagged portfolio items/i)).toBeInTheDocument();
expect(screen.getByText(/review queue/i)).toBeInTheDocument();
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/app.test.jsx`
Expected: FAIL because the current dashboard structure does not include the new sections.

- [ ] **Step 3: Implement the executive dashboard composition**

```jsx
<>
  <PageHeader title="Fairness Command Center" />
  <section className="summary-grid">...</section>
  <section className="priority-panel">...</section>
  <section className="content-grid">...</section>
  <RiskTable />
</>
```

- [ ] **Step 4: Run test to verify dashboard passes**

Run: `npm test -- --run tests/app.test.jsx`
Expected: PASS for the dashboard smoke test.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/Dashboard.jsx frontend/src/components/RiskTable.jsx frontend/tests/app.test.jsx
git commit -m "feat: implement executive dashboard redesign"
```

### Task 5: Verify Build and Regressions

**Files:**
- Verify: `frontend/src`
- Verify: `frontend/tests/app.test.jsx`

- [ ] **Step 1: Run targeted test**

Run: `npm test -- --run tests/app.test.jsx`
Expected: PASS

- [ ] **Step 2: Run full frontend test suite**

Run: `npm test -- --run`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS with a generated `dist/` output

- [ ] **Step 4: Manually verify in browser**

Run: `npm run dev -- --host 127.0.0.1`
Expected: the dashboard renders as a light, enterprise executive interface.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "chore: verify executive dashboard redesign"
```

## Self-Review

- Spec coverage: the plan fixes the styling foundation, redesigns the shell, updates the shared dashboard components, and implements the new executive dashboard structure defined in the approved spec.
- Placeholder scan: each task has exact files, checks, and commands with no `TODO` placeholders.
- Type consistency: component names and dashboard section names match the current repo structure and the approved design direction.
