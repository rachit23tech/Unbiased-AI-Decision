from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import AnalysisJob
from app.models.dataset import Dataset
from app.models.bias_result import BiasResult
from app.utils.auth import get_current_user
from app.workers.tasks import run_bias_analysis

router = APIRouter()

@router.post("/")
def create_job(body: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    dataset = db.query(Dataset).filter(Dataset.id == body["dataset_id"]).first()
    if not dataset:
        raise HTTPException(404, "Dataset not found")
    job = AnalysisJob(
        dataset_id=dataset.id,
        target_column=body["target_col"],
        sensitive_columns=body["sensitive_cols"]
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    run_bias_analysis.delay(str(job.id))
    return {"job_id": str(job.id), "status": job.status}

@router.get("/{id}/status")
def job_status(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    return {"job_id": str(job.id), "status": job.status}

@router.get("/{id}/results")
def job_results(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    job = db.query(AnalysisJob).filter(AnalysisJob.id == id).first()
    if not job:
        raise HTTPException(404, "Job not found")
    results = db.query(BiasResult).filter(BiasResult.job_id == id).all()
    return {
        "job_id": str(job.id),
        "status": job.status,
        "bias_score": job.bias_score,
        "results": [{"metric": r.metric_name, "value": r.metric_value, "threshold": r.threshold, "passed": r.passed} for r in results]
    }