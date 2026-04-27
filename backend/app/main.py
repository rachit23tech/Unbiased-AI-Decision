import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, datasets, jobs, models, reports, audit
from app.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Unbiased AI Decision API", version="1.0.0")

_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,https://ai-unbaiser.netlify.app")
allowed_origins = [o.strip() for o in _raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["datasets"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(audit.router, prefix="/api/v1/audit-log", tags=["audit"])

@app.get("/health")
def health():
    return {"status": "ok"}