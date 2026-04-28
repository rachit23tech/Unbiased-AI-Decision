# Unbiased AI Decision

[![Live Demo](https://img.shields.io/badge/Live_Demo-Frontend-blue?style=for-the-badge)](https://ai-unbaiser.netlify.app/)
[![API Status](https://img.shields.io/badge/API-Live_on_Cloud_Run-green?style=for-the-badge)](https://unbiased-ai-backend-393608700696.us-central1.run.app/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

An AI fairness platform for responsible decision-making.

Unbiased AI Decision helps teams detect, explain, and document bias in automated decision systems before those systems impact real people. The platform allows organizations to upload datasets and trained models, run fairness analysis across sensitive attributes, visualize risk, and generate downloadable audit reports with actionable recommendations.

## 🔗 Live Deployments

- **Frontend**: [https://ai-unbaiser.netlify.app/](https://ai-unbaiser.netlify.app/)
- **Backend API**: [https://unbiased-ai-backend-393608700696.us-central1.run.app](https://unbiased-ai-backend-393608700696.us-central1.run.app)

---

## Why This Matters

Automated systems increasingly influence hiring, lending, insurance, education, and healthcare decisions. When these systems are trained on incomplete, imbalanced, or historically biased data, they can reproduce unfair outcomes at scale. Most teams know fairness matters, but many lack the tools to inspect models and datasets in a practical, accessible way.

Unbiased AI Decision is designed to close that gap. The goal is to make fairness auditing understandable, usable, and operational for product teams, analysts, and organizations building AI-driven workflows.

## Key Features

- **Dataset and Model Upload**: Supports structured dataset uploads and optional trained model uploads.
- **Fairness Analysis Engine**: Computes industry-recognized fairness metrics across selected demographic groups, including Disparate Impact Ratio, Statistical Parity Difference, Equal Opportunity Difference, and Individual Fairness checks.
- **Explainability Layer**: Highlights which features most strongly affect model predictions using SHAP. Flags risks if sensitive attributes become top predictors.
- **Bias Audit Reports**: Generates downloadable PDF reports summarizing fairness metrics, overall bias score, and mitigation recommendations.
- **Role-Based Authentication**: Secure access with distinct user roles (Admin, Analyst, Viewer).

## Bias Scoring Approach

Each analysis produces an overall bias score from `0-100`, based on weighted fairness metric outcomes.
- `80-100`: Low Risk
- `50-79`: Medium Risk
- `0-49`: High Risk

## Tech Stack

### Frontend
- **React 18** & **Vite**
- **Tailwind CSS** & **shadcn/ui**
- **Recharts** (Visualizations)
- **Zustand** (State Management)
- Deployed on **Netlify**

### Backend
- **FastAPI** (Python 3.11+)
- **SQLAlchemy** & **SQLite / PostgreSQL**
- **python-jose** (JWT Auth)
- **ReportLab** (PDF Generation)
- Fairness libraries: **Fairlearn**, **AIF360**, **SHAP**, **Pandas**
- Deployed on **Google Cloud Run**

---

## Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/rachit23tech/Unbiased-AI-.git
cd "Unbiased-AI-"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Vision

Unbiased AI Decision is more than a dashboard. It is a step toward making responsible AI development practical, measurable, and visible. The project demonstrates how fairness analysis can move from an expert-only task to a product capability that teams can use before deployment, not after harm occurs.
