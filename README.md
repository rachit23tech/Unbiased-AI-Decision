# Unbiased AI Decision

An AI fairness platform for responsible decision-making.

Unbiased AI Decision helps teams detect, explain, and document bias in automated decision systems before those systems impact real people. Built as a hackathon-ready prototype, the platform allows organisations to upload datasets and trained models, run fairness analysis across sensitive attributes, visualize risk, and generate downloadable audit reports with actionable recommendations.

## Why This Matters

Automated systems increasingly influence hiring, lending, insurance, education, and healthcare decisions. When these systems are trained on incomplete, imbalanced, or historically biased data, they can reproduce unfair outcomes at scale. Most teams know fairness matters, but many lack the tools to inspect models and datasets in a practical, accessible way.

Unbiased AI Decision is designed to close that gap. The goal is to make fairness auditing understandable, usable, and operational for product teams, analysts, and organisations building AI-driven workflows.

## Problem Statement

Modern machine learning systems can appear accurate while still producing biased outcomes across demographic groups. This creates legal, ethical, and reputational risk. Teams need a way to:

- inspect uploaded datasets and models for hidden bias
- evaluate fairness across sensitive attributes such as gender, age, and race
- understand what factors are driving predictions
- generate audit-friendly outputs that support review and accountability

## Our Solution

Unbiased AI Decision is a full-stack web platform that combines bias detection, explainability, and reporting in one workflow.

Users can:

- upload datasets in `CSV` or `JSON` format
- optionally upload trained ML models
- select target and sensitive columns for fairness analysis
- compute fairness metrics using libraries such as `Fairlearn`, `AIF360`, and `SHAP`
- review a visual bias dashboard with severity indicators
- download an audit report with metrics and recommendations

## Prototype Highlights

- Bias metrics dashboard with clear pass/fail status
- Overall bias score with low, medium, and high risk bands
- SHAP-based feature importance and sensitive-feature flagging
- Report generation for downloadable fairness audits
- Authentication with user roles for secure access
- Background job processing for non-blocking analysis

## Key Features

### 1. Dataset and Model Upload

The platform supports structured dataset uploads and optional trained model uploads. This makes it useful both for early dataset auditing and for post-training model review.

### 2. Fairness Analysis Engine

The backend computes industry-recognized fairness metrics across selected demographic groups, including:

- Disparate Impact Ratio
- Statistical Parity Difference
- Equalized Odds Difference
- Equal Opportunity Difference
- Individual Fairness checks
- SHAP-based sensitive feature influence analysis

### 3. Explainability Layer

The platform highlights which features most strongly affect model predictions. If sensitive attributes become top predictors, the system raises a warning so teams can investigate potential fairness risks.

### 4. Bias Audit Reports

Each completed analysis can produce a downloadable report that summarizes:

- fairness metrics
- overall bias score
- flagged risk areas
- practical recommendations for mitigation

### 5. Prototype-Friendly User Experience

The frontend is designed as a clean, demo-ready experience with:

- drag-and-drop uploads
- metric cards and charts
- report views
- protected routes for authenticated workflows

## How It Works

The platform follows a three-tier architecture:

`React Frontend` -> `FastAPI Backend` -> `PostgreSQL Database`

Supporting services:

- `Celery` handles long-running fairness analysis jobs
- `Redis` acts as the message broker for background workers
- `ReportLab` generates downloadable PDF reports

### Workflow

1. A user uploads a dataset and optional model.
2. The backend validates the input and stores metadata.
3. A background job runs fairness and explainability analysis.
4. Results are stored and exposed through API endpoints.
5. The frontend displays dashboards, SHAP insights, and downloadable reports.

## Tech Stack

### Frontend

- `React 18`
- `Vite`
- `Tailwind CSS`
- `shadcn/ui`
- `Recharts`
- `Zustand`
- `Axios`
- `React Query`

### Backend

- `FastAPI`
- `Python 3.11+`
- `SQLAlchemy`
- `PostgreSQL`
- `Celery`
- `Redis`
- `python-jose` for JWT auth
- `ReportLab`

### Fairness and Explainability

- `Fairlearn`
- `AIF360`
- `SHAP`
- `Pandas`

### Testing and DevOps

- `pytest`
- `httpx`
- `Vitest`
- `Testing Library`
- `Docker`
- `docker-compose`

## Core Screens

- `Login / Register`: secure access and role-aware authentication
- `Dashboard`: summary cards, average bias score, flagged analyses
- `Upload`: dataset and model upload with validation and preview
- `Analysis Results`: metric breakdown, bias score, and SHAP visualizations
- `Reports`: downloadable reports and recommendation cards
- `Settings / Audit Log`: user settings and traceable platform activity

## Bias Scoring Approach

Each analysis produces an overall bias score from `0-100`, based on weighted fairness metric outcomes.

- `80-100`: Low Risk
- `50-79`: Medium Risk
- `0-49`: High Risk

This score gives teams a fast way to understand fairness posture before reviewing the deeper metric details.

## 8-Day Prototype Roadmap

| Day | Theme | Main Outcome |
| --- | --- | --- |
| 1 | Scaffolding and design | FastAPI and React apps initialized, schema and routing planned |
| 2 | Data ingestion | Dataset upload flow and validation in place |
| 3 | Bias engine | Core fairness metrics integrated and dashboard skeleton ready |
| 4 | Explainability | SHAP insights and flagging logic added |
| 5 | Reports | PDF reporting and recommendation engine implemented |
| 6 | Auth and roles | JWT auth, protected routes, and audit log support added |
| 7 | Integration and testing | Real API wiring, edge-case handling, and test coverage improved |
| 8 | Polish and deployment | Final QA, docs, deployment, and demo preparation complete |

## Team Plan

### Backend Responsibilities

- API design and implementation with `FastAPI`
- PostgreSQL schema and data models
- fairness metric computation pipeline
- background jobs with `Celery` and `Redis`
- PDF report generation
- JWT authentication and role-based access
- backend testing and deployment

### Frontend Responsibilities

- React app setup and route structure
- upload workflows and validation UI
- metrics dashboard and charting
- SHAP and alert visualizations
- reports UI and download actions
- authentication flows and protected routing
- frontend testing, responsiveness, and demo polish

## Proposed Project Structure

```text
backend/
  app/
    main.py
    config.py
    database.py
    models/
    schemas/
    routers/
    services/
    workers/
    utils/
  tests/
  Dockerfile
  requirements.txt

frontend/
  src/
    main.jsx
    App.jsx
    pages/
    components/
    store/
    api/
    utils/
  tests/
  vite.config.js
```

## Getting Started

This repository is currently in the planning and prototype-definition stage. The intended local setup is:

### Backend

```bash
cd backend
python -m venv venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## Testing Strategy

### Backend

- unit tests for fairness metric calculations
- integration tests for API endpoints
- validation tests for malformed uploads and auth failures

### Frontend

- component tests for dashboard cards and charts
- upload flow tests
- protected route tests
- mocked API interaction tests

## Risks and Mitigation

### Slow Fairness Computation

Large datasets can make fairness analysis expensive.

Mitigation: use background workers, cap prototype dataset sizes, and optimize in later iterations.

### Library Instability

Fairness libraries can change APIs over time.

Mitigation: pin dependency versions and isolate metric logic behind service layers.

### Integration Delays

Frontend and backend integration may slip late in the sprint.

Mitigation: define API contracts early and use mock data until real endpoints are ready.

## Future Scope

- support more file formats and model frameworks
- add fairness mitigation suggestions and retraining workflows
- enable organisation-wide audit history and collaboration
- provide benchmark datasets and guided onboarding
- expand compliance-ready reporting for enterprise use

## Vision

Unbiased AI Decision is more than a dashboard. It is a step toward making responsible AI development practical, measurable, and visible. The prototype demonstrates how fairness analysis can move from an expert-only task to a product capability that teams can use before deployment, not after harm occurs.
