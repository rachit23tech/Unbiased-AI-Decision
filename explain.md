# Unbiased AI — Platform Walkthrough & Pitch Guide

> **One-line pitch:** Unbiased AI is an enterprise governance platform that automatically detects, explains, and fixes bias in AI decision-making systems — before they cause legal, regulatory, or reputational harm.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Market Opportunity](#2-the-market-opportunity)
3. [Our Solution](#3-our-solution)
4. [Platform Architecture](#4-platform-architecture)
5. [Full End-to-End Workflow](#5-full-end-to-end-workflow)
6. [Feature Deep-Dives](#6-feature-deep-dives)
7. [Security & Compliance](#7-security--compliance)
8. [Live Demo Script](#8-live-demo-script)
9. [Testing Guide](#9-testing-guide)
10. [Competitive Differentiation](#10-competitive-differentiation)
11. [Business Model & Traction](#11-business-model--traction)

---

## 1. The Problem

Every day, AI systems make millions of decisions that determine who gets a loan, who gets hired, who receives medical treatment, and who qualifies for insurance. These systems are trained on historical data — data that carries decades of human bias.

**The consequences are severe and already happening:**

- Amazon scrapped its AI hiring tool after it was found to systematically downgrade resumes from women.
- A healthcare algorithm used by US hospitals was found to assign lower risk scores to Black patients than equally sick White patients.
- Multiple banks have faced regulatory action for AI-driven lending discrimination under ECOA and Fair Housing Act.
- The EU AI Act (2024) now mandates bias audits for all high-risk AI systems — with fines up to €30 million or 6% of global turnover.

**The core problem:** There is no standardised, accessible tooling for enterprises to detect and fix AI bias before deployment. Most teams rely on ad-hoc scripts, internal reviewers with no legal context, or simply hope their models are fair.

---

## 2. The Market Opportunity

| Metric | Value |
|--------|-------|
| AI Governance market size (2024) | $1.8 billion |
| Projected market size (2030) | $11.4 billion |
| CAGR | ~35% |
| Companies subject to EU AI Act | 60,000+ globally |
| Average cost of a discrimination lawsuit | $500K–$3M+ |
| Average regulatory fine (ECOA/EEOC violation) | $1M–$27M |

Every Fortune 500 company deploying AI in HR, lending, insurance, or healthcare is a target customer. The regulatory forcing function from EU AI Act, EEOC enforcement, and CFPB scrutiny makes this a **must-have**, not a nice-to-have.

---

## 3. Our Solution

**Unbiased AI** is a full-stack fairness governance platform that gives enterprise teams one place to:

| Capability | What It Does |
|------------|-------------|
| **Upload & Analyse** | Accepts CSV datasets or ML model files; computes real disparate impact ratios per protected attribute |
| **Auto-Approve/Reject** | Configurable thresholds automatically approve compliant models and reject non-compliant ones in real time |
| **Regulatory Compliance** | Auto-detects applicable laws (ECOA, EEOC, GDPR Art.22, EU AI Act, ADA) and maps scores to regulatory thresholds |
| **Explainability (SHAP)** | Shows which features drive decisions and flags protected attributes with high influence |
| **Counterfactual Analysis** | Proves bias by showing outcome probability lift when only the protected attribute is changed |
| **Remediation Plans** | Auto-generates step-by-step mitigation plans per attribute with severity levels |
| **Continuous Monitoring** | Tracks fairness drift over time; triggers alerts when production models degrade |
| **Approval Workflow** | Full sign-off system with audit log for governance and legal teams |
| **Role-Based Access** | Admin, Analyst, and Viewer roles with enforced permissions |
| **Notification System** | Real-time alerts for approval events, rejections, and drift detection |

---

## 4. Platform Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React 18)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Upload   │ │ Analysis │ │Monitoring│ │ Reports  │   │
│  │ Intake   │ │ Results  │ │Dashboard │ │& Approvals│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Global State (Zustand)                │  │
│  │  useAnalysisStore │ useAuthStore │ useNotifStore  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Utility Layer                         │  │
│  │  security.js │ approvalParams.js │ Recharts/Framer │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                    REST API (FastAPI)
                          │
┌─────────────────────────────────────────────────────────┐
│                  Backend (Python/FastAPI)                 │
│         Auth · Model Inference · Report Storage          │
└─────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- **Frontend:** React 18, React Router 6, Zustand, Recharts, Framer Motion, Vite 6
- **Backend:** FastAPI (Python) — API-first, connects to real ML pipelines
- **Storage:** localStorage (session/offline-first) + backend persistence
- **Security:** Crypto-grade tokens, session expiry, rate limiting, RBAC
- **Design:** Custom enterprise design system (CSS variables, glassmorphism dark theme)

---

## 5. Full End-to-End Workflow

### Step 1 — Authentication

**URL:** `/login`

The platform opens to a secure login portal. Three role tiers exist:

| Role | Access | Demo Credentials |
|------|--------|-----------------|
| **Admin** | All pages + Settings + Invite Members | `admin@demo.com` / `Demo@1234` |
| **Analyst** | Upload, Analysis, Monitoring, Reports | `analyst@demo.com` / `Demo@1234` |
| **Viewer** | Dashboard + Reports (read-only) | `viewer@demo.com` / `Demo@1234` |

Security features active at login:
- **Rate limiting:** 5 failed attempts → 15-minute lockout with countdown timer
- **Remember Me:** 30-day persistent session vs. 8-hour session-only token
- **Session tokens:** Generated via `crypto.getRandomValues` (cryptographically secure)
- **Input sanitisation:** All inputs HTML-entity encoded to prevent XSS

---

### Step 2 — Dashboard Overview

**URL:** `/dashboard`

The command centre. On first load it shows the platform's health at a glance:

- **KPI Strip:** Total models reviewed, average fairness score, high-risk models flagged, pending approvals
- **Portfolio Fairness Trend:** Live AreaChart of fairness scores over time, pulling from your actual analysis history
- **Priority Queue:** The most recent analyses pending governance sign-off
- **Risk Table:** All analysed models ranked by risk level

Everything on this page updates in real time as you run analyses — nothing is hardcoded.

---

### Step 3 — Upload & Configure

**URL:** `/upload`

This is the intake workflow. The user:

1. **Uploads a file** — supported formats:
   - `.csv` / `.json` — parsed directly in the browser for real disparate impact computation
   - `.pkl` / `.joblib` / `.onnx` / `.h5` — model files (scored via backend inference; mock scores in demo mode)

2. **Selects the Target Outcome** — the platform auto-detects the governing regulation:

   | Outcome | Regulation |
   |---------|-----------|
   | Loan Approval | ECOA / Fair Housing Act |
   | Hiring Decision | EEOC — 4/5ths Rule |
   | Medical Diagnosis / Treatment | ADA / EU AI Act |
   | Credit Scoring | ECOA / FCRA |
   | Insurance Risk | ECOA |
   | Claims Processing | ADA |
   | Churn Prediction | GDPR Article 22 |

3. **Selects Protected Attributes** to monitor: Gender, Race/Ethnicity, Age, Disability Status, Nationality, Religion

4. **Assigns a Business Owner** (Credit Risk, Talent Operations, Clinical Operations, etc.)

5. **Clicks Launch Analysis**

**What happens under the hood:**
- For CSV files: the system reads headers, finds matching protected attribute columns and target outcome column, then computes real **Disparate Impact ratios** group by group
- If columns don't match exactly: deterministic pseudo-random scores seeded by file content hash (reproducible — same file always gives same score)
- The computed result is immediately run through the **Auto-Approval engine**

---

### Step 4 — Auto-Approval Engine

Runs **instantly** the moment analysis completes, before the user even sees the results.

**Configured parameters (Settings → Security & Roles → Auto-Approval Parameters):**

| Parameter | Default | Meaning |
|-----------|---------|---------|
| Min. Overall Score | 70 | Overall fairness score must be ≥ 70 to pass |
| Min. Attribute Score | 60 | Every protected attribute score must be ≥ 60 |
| Max Failing Attributes | 0 | Zero tolerance — all attributes must pass |

**If all checks pass → Auto-Approved:**
- `approvalStatus: "approved"` written to history
- Green notification fires: *"HR_Analytics.csv passed all fairness checks and was automatically approved."*
- Report appears in Reports page with green Approved badge

**If any check fails → Auto-Rejected:**
- `approvalStatus: "auto_rejected"` written to history with specific failure reasons
- Red notification fires: *"HR_Analytics.csv failed 1 check(s): Overall score 58 is below the required minimum of 70."*
- Full analysis is still displayed (so the team can understand and fix the issues)
- Red banner on Analysis page lists exact failure reasons and links to Settings to adjust thresholds

---

### Step 5 — Analysis Results

**URL:** `/analysis`

The most detailed page in the platform. Contains seven panels:

#### Panel 1 — Overall Fairness Score (Gauge)
Animated semicircle gauge in green/amber/red based on composite score. Score is the average of all monitored attribute scores.

#### Panel 2 — Attribute Cards
One card per protected attribute. Shows individual score, risk label (Low/Medium/High), and a one-line interpretation.

#### Panel 3 — Fairness Score Bar Chart
Colour-coded bar chart with a threshold reference line at 70. Red bars = immediate remediation. Amber = monitor. Green = compliant.

#### Panel 4 — Fairness Metric Breakdown
Three core fairness metrics with scores:
- **Demographic Parity** — difference in positive prediction rates across groups
- **Equalized Odds** — true/false positive rate parity
- **Calibration** — predicted probability accuracy per group

#### Panel 5 — Regulatory Compliance
Auto-detected regulations assessed against the actual score. Each regulation card shows:
- Pass/Fail badge (green shield vs red shield)
- Regulation name and legal description
- Required threshold vs. achieved score

#### Panel 6 — SHAP Feature Importance
Horizontal bar chart showing estimated contribution of each input feature to model decisions. Protected attributes highlighted in red — instantly shows when a protected attribute is a top driver.

#### Panel 7 — Counterfactual Analysis
Only appears when bias is detected. Shows a table proving discrimination: for an identical applicant, changing only the protected attribute (e.g. Female → Male) produces a statistically significant outcome lift. This is the smoking-gun evidence required under GDPR Article 22 for mandatory explainability.

#### Panel 8 — Remediation Plan
Per-attribute step-by-step mitigation plans, severity-coded:
- **Critical (red):** Immediate action required — remove feature, mandatory human review
- **Warning (amber):** Re-weight training data, add fairness constraints
- General governance checklist (interactive checkboxes)

**Approval actions** in the page header (Admin role):
- **Approve for Production** — manually approve a borderline result
- **Reject** — send back for remediation

---

### Step 6 — Reports & Audit Trail

**URL:** `/reports`

All historical analysis runs in one searchable, filterable table.

**Filters:**
- Full-text search (file name, owner, outcome)
- Risk level filter (Low / Medium / High)
- Approval status filter (Approved / Pending / Rejected / Auto-Rejected)

**Per-report row shows:**
- File name, target outcome, business owner
- Risk level pill
- Fairness score
- Approval status badge with icon
- Time since run
- Quick Approve/Reject buttons for pending items

**Pending sign-off banner:** When there are pending reviews, a yellow banner appears at the top prompting governance teams to act.

This page serves as the **official audit trail** — every analysis run is logged with timestamp, who ran it, what outcome was assessed, and the final approval decision. This is what you show to regulators.

---

### Step 7 — Continuous Monitoring

**URL:** `/monitoring`

Production models don't stay fair — data drift, demographic shifts, and model updates can erode fairness over time.

**KPI Strip:** Total monitored models, healthy count, drifting count, critical count.

**Model Cards:** One card per unique target outcome that has been analysed:
- Current fairness score
- Score delta vs. previous run (↑ improving / ↓ drifting)
- Status badge (Healthy / Drifting / Critical)
- Sparkline trend chart
- **Trigger Review** button — queues the model for re-analysis

**Drift Alerts Panel:** Live alerts for models showing statistically significant score drops.

**Automated Trigger Grid:** Explains what events cause automatic re-analysis:
- Fairness score drops > 5 points
- New demographic shift detected in input data
- Model update or re-training event
- 30-day scheduled review cadence

---

### Step 8 — Settings & Administration

**URL:** `/settings` (Admin only)

Three tabs:

#### Account Tab
- Profile details (name, title, email, organisation)
- Notification preferences with live toggles:
  - Analysis completion alerts
  - High-risk model escalations
  - Weekly fairness digest (every Monday)

#### Security & Roles Tab

**Team Members:**
- View all members with role badges
- **Invite Member:** Click button → inline form expands → enter name (optional), email, role → Send Invitation → member appears in list instantly

**Auto-Approval Parameters:** The critical governance configuration:
- Set minimum overall score (default 70)
- Set minimum per-attribute score (default 60)
- Set max failing attributes allowed (default 0)
- Live preview pills show current active thresholds
- Reset to defaults button
- Changes take effect on the next analysis run

**Two-Factor Authentication toggle**

**Audit Log:** Recent platform activity — analyses run, reports downloaded, members invited, models flagged.

#### Integrations Tab
- **API Keys:** Generate, copy, and manage API keys for CI/CD pipeline integration
- **Webhooks:** Configure endpoint URL, signing secret, and trigger events (analysis.completed, model.flagged, etc.)

---

### Step 9 — Notification System

**Bell icon** in the sidebar (bottom-left, next to role badge).

- Red badge shows unread count
- Click to open notification panel
- Colour-coded by type: green (approved), red (rejected), amber (warning), blue (info)
- Each notification: title, reason message, relative timestamp
- Individual dismiss or bulk "Mark all read" / "Clear all"
- Persists across browser sessions via localStorage

---

### Step 10 — Session Security & Inactivity

Running continuously in the background:

- **30-minute inactivity auto-logout** — a countdown modal appears with 5 minutes warning
- "Stay signed in" button resets the timer
- Session expiry validated on every page load
- Expired sessions clear immediately and redirect to login
- Inactivity logout message shown on the login page on return

---

## 6. Feature Deep-Dives

### Real Disparate Impact Computation

The platform performs genuine statistical analysis when a CSV is uploaded with matching column headers.

**Algorithm:**
1. Parse CSV headers
2. Find the column matching the selected protected attribute (e.g. `gender`)
3. Find the column matching the target outcome (e.g. `hiring_decision`)
4. Group rows by protected attribute value
5. Compute positive outcome rate per group: `positives / total` for each group
6. Disparate Impact Ratio = `min(group rates) / max(group rates)`
7. Score = `min(98, max(20, round(DI_ratio × 105)))`

A DI ratio below 0.8 means the minority group is selected at less than 80% the rate of the majority group — the legal threshold under EEOC's 4/5ths rule.

### Deterministic Mock Scoring

When columns don't match (model files, non-standard CSVs):
- Seeds a deterministic pseudo-random generator from the file content hash
- Same file → always the same scores (reproducible)
- Different files → different scores (realistic variation)
- Ensures demos are consistent and presentations are reproducible

### Password Strength Engine

Five-criteria scoring:
1. Minimum 8 characters
2. At least one uppercase letter
3. At least one lowercase letter
4. At least one number
5. At least one special character

Real-time strength meter with colour-coded segments (red → amber → green) and pass/fail indicators per criterion.

---

## 7. Security & Compliance

### Authentication Security

| Feature | Implementation |
|---------|---------------|
| Token generation | `crypto.getRandomValues` — cryptographically secure 64-character hex token |
| Session storage | `sessionStorage` (normal) or `localStorage` (remember me) |
| Session expiry | 8-hour default, 30-day with remember-me |
| Login rate limiting | 5 attempts → 15-minute lockout, stored in `localStorage` |
| Lockout persistence | Survives page refresh; cleared only on successful login |
| Input sanitisation | HTML entity encoding on all user inputs before API calls |
| Password policy | Uppercase + lowercase + number required minimum |
| Self-registration | Admin role excluded — admin accounts are invite-only |

### Role-Based Access Control (RBAC)

| Page | Admin | Analyst | Viewer |
|------|-------|---------|--------|
| Dashboard | ✓ | ✓ | ✓ |
| Upload | ✓ | ✓ | ✗ |
| Analysis | ✓ | ✓ | ✗ |
| Monitoring | ✓ | ✓ | ✗ |
| Reports | ✓ | ✓ | ✓ |
| Settings | ✓ | ✗ | ✗ |

All routes are guarded server-side at the React Router level — navigating directly to a restricted URL redirects to the appropriate page.

### Inactivity Management

- DOM events monitored: `mousemove`, `mousedown`, `keydown`, `scroll`, `touchstart`, `click`
- Activity resets a `useRef` timestamp (no re-renders on every mouse move)
- 1-second polling interval checks idle time
- Warning modal at 25 minutes, auto-logout at 30 minutes
- Session extension on "Stay signed in" via `refreshExpiry()`

---

## 8. Live Demo Script

> Use this script for your video. Each section is ~1–2 minutes. Total demo: ~12 minutes.

---

### Opening (30 seconds)

*"Every company deploying AI in hiring, lending, healthcare, or insurance faces the same invisible risk: their models may be discriminating against protected groups without anyone knowing. Regulatory fines, lawsuits, and reputational damage follow. Unbiased AI solves this."*

---

### Scene 1 — Login (1 minute)

1. Open the app to the Login page
2. Point out the enterprise design: *"Built for enterprise — role-based, secure, audit-ready from day one."*
3. Click **Use** on the Admin demo account (admin@demo.com)
4. Click **Sign in**
5. Land on Dashboard — *"This is the command centre. Every metric here is live — pulled from real analysis runs."*

---

### Scene 2 — Dashboard (1 minute)

1. Point to the KPI strip: *"Total models reviewed, average score, high-risk flags, pending approvals — your entire AI fairness posture at a glance."*
2. Hover over the Portfolio Fairness Trend chart: *"This is not mock data — this updates every time your team runs an analysis."*
3. Point to the Priority Queue: *"Models waiting for governance sign-off are queued here so nothing slips through."*

---

### Scene 3 — Upload & Analyse (2 minutes)

1. Click **Upload Models** in the nav
2. Click **Choose File** → select the hiring test CSV (or HR_Analytics.csv)
3. *"The platform detects it's a CSV dataset — it will compute real disparate impact ratios, not just mock scores."*
4. Select **Hiring Decision** as target outcome → *"EEOC regulations are auto-detected. The platform knows which laws apply."*
5. Select **Talent Operations** as business owner
6. Check **Gender** and **Age**
7. Point to the Submission Checklist: *"Live preview so nothing is missed before launch."*
8. Click **Launch Analysis**
9. *"Analysing... and the auto-approval engine is running in parallel."*

---

### Scene 4 — Auto-Approval & Notification (1 minute)

1. As soon as Analysis loads, point to the notification bell: *"A notification just fired. Let's see what happened."*
2. Click the bell
3. Show the notification: *"The system evaluated this report against our configured thresholds — minimum overall score of 70, minimum attribute score of 60 — and made an instant decision."*
4. If rejected: *"It was auto-rejected because the score didn't meet our governance bar. The full analysis is still here so we know exactly why."*

---

### Scene 5 — Analysis Results (3 minutes)

1. Point to the red auto-rejection banner: *"Exact failure reasons, not a vague error. And a direct link to Settings to adjust thresholds."*
2. Point to the gauge: *"Overall fairness score of [X]. Below our 70-point threshold."*
3. Point to attribute cards: *"Gender is at [X] — low risk. Age is at [X] — that's the problem attribute."*
4. Scroll to Regulatory Compliance: *"EEOC 4/5ths rule — non-compliant. EU AI Act — non-compliant. This is what gets you fined."*
5. Scroll to SHAP: *"Feature importance. Age is a top driver AND a protected attribute — that red bar is the smoking gun."*
6. Scroll to Counterfactual: *"For an identical applicant, changing only their age group produces a 15% higher approval probability. That's discrimination — and under GDPR Article 22, the applicant has the right to this exact explanation."*
7. Scroll to Remediation: *"Step-by-step fix plan. Remove age-correlated proxy features, apply equal opportunity constraint, mandate human review for age-edge cases."*

---

### Scene 6 — Settings: Configure Thresholds (1 minute)

1. Click **Settings** → **Security & Roles** tab
2. Point to Auto-Approval Parameters: *"This is the governance configuration. Every analysis runs through these thresholds automatically."*
3. Lower Min. Overall Score to 50, click **Save Parameters**
4. *"Now models with scores above 50 will auto-approve. Adjust this as your organisation matures its fairness standards."*

---

### Scene 7 — Reports (1 minute)

1. Click **Reports**
2. *"Every analysis run, logged permanently with timestamp, owner, outcome, and approval decision. This is your audit trail — what you show regulators."*
3. Use the search filter: *"Search by file name, filter by risk level or approval status."*
4. Point to a pending report: *"Manual override is always available for borderline cases requiring human judgment."*

---

### Scene 8 — Monitoring (30 seconds)

1. Click **Monitoring**
2. *"Production models don't stay fair. This page tracks fairness drift over time. When a model's score drops, an alert fires and a re-review is automatically triggered."*

---

### Closing (30 seconds)

*"Unbiased AI turns AI governance from a manual, reactive, legal-risk process into an automated, proactive, audit-ready workflow. One platform — upload, analyse, approve, monitor. Everything logged. Every regulation mapped. Every bias explained and remediated."*

*"We're targeting enterprises in financial services, healthcare, and HR technology — sectors where AI bias isn't just an ethical issue, it's a multi-million dollar legal liability. The EU AI Act alone creates urgency for 60,000 companies globally. We're the infrastructure they need."*

---

## 9. Testing Guide

### Test 1 — Full Happy Path (Auto-Approved)

**Setup:** In Settings → Security & Roles, set Min. Overall Score to **50**, Min. Attribute Score to **40**.

**Test CSV** — save as `fair_hiring.csv`:
```csv
gender,age,experience_years,hiring_decision
male,32,5,1
female,30,5,1
male,45,10,1
female,42,10,1
male,28,3,1
female,27,3,1
male,38,7,0
female,36,7,0
male,55,15,0
female,53,15,0
```

**Steps:**
1. Login as admin@demo.com
2. Upload `fair_hiring.csv`
3. Select Hiring Decision, Talent Operations, check Gender + Age
4. Launch Analysis
5. **Expected:** Green notification fires. Analysis page shows "Approved" status. No rejection banner. Green shields on EEOC compliance.

---

### Test 2 — Auto-Rejection Flow

**Setup:** In Settings → Security & Roles, set Min. Overall Score to **80** (strict).

**Test CSV** — save as `biased_hiring.csv`:
```csv
gender,age,experience_years,hiring_decision
male,32,5,1
female,28,4,0
male,45,12,1
female,35,8,0
male,29,3,1
female,41,10,0
male,52,15,1
female,26,2,0
```

**Steps:**
1. Upload `biased_hiring.csv`
2. Select Hiring Decision, Gender + Age
3. Launch Analysis
4. **Expected:** Red notification fires with failure reason. Analysis page shows red auto-rejection banner with exact failure messages. SHAP shows gender as high-influence feature. Counterfactual table appears.

---

### Test 3 — Role-Based Access Control

**Steps:**
1. Login as viewer@demo.com
2. **Expected:** Upload, Analysis, Monitoring, Settings nav items are hidden
3. Try navigating to `/upload` directly
4. **Expected:** Redirected to `/dashboard`
5. Login as analyst@demo.com
6. **Expected:** Settings is hidden but Upload, Analysis, Monitoring visible

---

### Test 4 — Login Rate Limiting

**Steps:**
1. Go to `/login`
2. Enter `admin@demo.com` with wrong password **5 times**
3. **Expected:** Lockout banner appears with 15-minute countdown timer
4. **Expected:** Email and password fields are disabled
5. Wait for countdown or clear `localStorage` key `auth_lockout` in DevTools to reset

---

### Test 5 — Inactivity Auto-Logout

**Setup:** Temporarily lower `INACTIVITY_MS` in `src/utils/security.js` to `2 * 60 * 1000` (2 minutes) and `WARNING_MS` to `30 * 1000` (30 seconds) for testing.

**Steps:**
1. Login, navigate to Dashboard
2. Stop all mouse/keyboard activity
3. **Expected at ~1:30:** Warning modal appears — "Are you still there?" with countdown
4. Click "Stay signed in" → modal dismisses, session refreshed
5. Go idle again until timer hits zero
6. **Expected:** Auto-logout, redirected to Login page
7. **Restore** the original values after testing

---

### Test 6 — Invite Member

**Steps:**
1. Login as admin@demo.com
2. Go to Settings → Security & Roles tab
3. Click **Invite Member** button
4. Enter name: "Alex Chen", email: "alex@company.com", role: Analyst
5. Click **Send Invitation**
6. **Expected:** "✓ Invitation sent" feedback, form closes, Alex appears in the member list with initials "AC" and Analyst badge

---

### Test 7 — Notification System

**Steps:**
1. Run two analyses (one that passes, one that fails the thresholds)
2. Click the bell icon in the sidebar
3. **Expected:** Two notifications visible — green (approved) and red (rejected)
4. Click a notification → it becomes dimmed (marked read), badge count decreases
5. Click "All read" → all notifications marked read, badge disappears
6. Click the × on a notification → it dismisses
7. Refresh the page → notifications still appear (persisted in localStorage)

---

### Test 8 — API Key Generation

**Steps:**
1. Login as admin@demo.com → Settings → Integrations tab
2. Click **New Key**
3. **Expected:** New API key appears in the list with today's date and "Active" badge
4. Click **Copy** on any key
5. **Expected:** Button shows "✓ Copied" for 2 seconds

---

### Test 9 — Register New Account

**Steps:**
1. Go to `/register`
2. **Expected:** Admin role is NOT available in the role picker
3. Enter a weak password (e.g. "password")
4. **Expected:** Strength meter shows red segments, criteria checklist shows failures
5. Enter "Demo@1234" → **Expected:** All 5 criteria check green, meter turns green
6. Enter mismatching confirm password → **Expected:** Red border + "Passwords do not match"
7. Match passwords → **Expected:** Green border + "Passwords match"
8. Complete form and submit → lands on Dashboard as Analyst

---

### Test 10 — End-to-End Loan Approval (Regulatory Focus)

**Test CSV** — save as `loan_data.csv`:
```csv
race,age,income,credit_score,loan_approved
white,35,75000,720,1
black,34,74000,715,0
white,42,90000,750,1
black,41,89000,748,0
white,28,55000,680,1
black,27,54000,678,0
white,50,110000,800,1
black,49,109000,798,0
```

**Steps:**
1. Upload `loan_data.csv`
2. Select **Loan Approval**, **Credit Risk**, check **Race/Ethnicity** and **Age**
3. Launch Analysis
4. **Expected:** ECOA/Fair Housing and EU AI Act regulations auto-detected
5. **Expected:** Compliance panel shows ECOA non-compliant (race-based disparity)
6. **Expected:** Counterfactual shows race change → significant outcome lift (confirms redlining pattern)

---

## 10. Competitive Differentiation

| Feature | Unbiased AI | IBM OpenScale | AWS Clarify | Fiddler AI |
|---------|-------------|---------------|-------------|------------|
| No-code upload & analyse | ✓ | Partial | Partial | ✗ |
| Auto-approval workflow | ✓ | ✗ | ✗ | ✗ |
| Regulatory auto-mapping | ✓ | Partial | ✗ | ✗ |
| Counterfactual explanations | ✓ | ✗ | Partial | ✓ |
| Remediation plans | ✓ | ✗ | ✗ | Partial |
| Real-time notification system | ✓ | ✗ | ✗ | Partial |
| Browser-native (no infra required) | ✓ | ✗ | ✗ | ✗ |
| Role-based access control | ✓ | ✓ | Partial | ✓ |
| Configurable thresholds | ✓ | Partial | ✗ | ✓ |
| SME-accessible (no ML expertise needed) | ✓ | ✗ | ✗ | ✗ |

**Our key differentiator:** Unbiased AI is the only platform that goes from raw dataset → regulatory compliance check → counterfactual proof → remediation plan → governance approval in a single, no-code workflow. Competitors require ML engineers. We serve compliance officers, legal teams, and business owners.

---

## 11. Business Model & Traction

### Revenue Model

| Tier | Target | Price | Included |
|------|--------|-------|----------|
| **Starter** | SMEs, scale-ups | $2,000/mo | 50 analyses/mo, 5 users, standard regulations |
| **Professional** | Mid-market | $8,000/mo | Unlimited analyses, 25 users, all regulations, API access |
| **Enterprise** | Fortune 500 | $30,000+/mo | Custom integrations, on-prem deployment, dedicated CSM, SLA |

### Go-to-Market

**Priority verticals:**
1. **Financial Services** — Banks, fintechs, credit bureaus (ECOA, FCRA mandatory compliance)
2. **Healthcare** — Hospital systems, health insurers (ADA, EU AI Act)
3. **HR Tech** — ATS providers, large employers (EEOC, EU AI Act)

**Entry wedge:** EU AI Act compliance deadline (2025–2026 enforcement) creates immediate urgency for European operations and US companies with EU customers.

**Partnership strategy:** Partner with the Big 4 (Deloitte, PwC, KPMG, EY) AI risk practices — they have the enterprise relationships, we have the tooling.

### Why Now

1. **EU AI Act** became enforceable in 2024 — fines up to €30M or 6% of global revenue
2. **CFPB and EEOC** have dramatically increased AI discrimination enforcement
3. **Board-level attention:** AI governance is now a C-suite and audit committee agenda item
4. **No dominant player** — the market leader position is still available

---

## Appendix — Quick Reference

### Demo Account Credentials
```
Admin:   admin@demo.com   / Demo@1234
Analyst: analyst@demo.com / Demo@1234
Viewer:  viewer@demo.com  / Demo@1234
```

### Default Approval Thresholds
```
Minimum Overall Score:    70
Minimum Attribute Score:  60
Max Failing Attributes:    0
```

### Supported File Types
```
.csv    — Full disparate impact computation
.json   — Full disparate impact computation
.pkl    — Mock scoring (ML model, needs backend)
.joblib — Mock scoring (scikit-learn model)
.onnx   — Mock scoring (ONNX model)
.h5     — Mock scoring (Keras/TensorFlow model)
```

### CSV Column Naming for Real DI Computation
```
Protected attributes: gender, race, age, disability_status, nationality, religion
Target outcomes:      loan_approved, hiring_decision, medical_diagnosis,
                      medical_treatment, insurance_risk, credit_scoring,
                      claims_approved, churn_prediction
Target values:        1 / 0  or  true / false  or  yes / no
```

### Local Storage Keys (for debugging)
```
auth_session       — current session (sessionStorage or localStorage)
auth_lockout       — login attempt records per email
analysis_history   — all analysis runs (up to 50)
notifications      — notification history (up to 200)
approval_params    — configured approval thresholds
```

---

*Built for the AI Governance Challenge — Unbiased AI, 2026*
