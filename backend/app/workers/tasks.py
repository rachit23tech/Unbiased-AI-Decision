from celery import Celery
from app.config import settings
from app.database import SessionLocal
from app.models.job import AnalysisJob
from app.models.dataset import Dataset
from app.models.bias_result import BiasResult
from app.models.report import Report
from app.services.bias_engine import compute_bias_metrics
from app.services.report_service import generate_pdf_report, generate_recommendations
import pandas as pd, datetime

celery_app = Celery("tasks", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

@celery_app.task
def run_bias_analysis(job_id: str):
    db = SessionLocal()
    try:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        job.status = "running"
        job.started_at = datetime.datetime.utcnow()
        db.commit()
        dataset = db.query(Dataset).filter(Dataset.id == job.dataset_id).first()
        df = pd.read_csv(dataset.file_path)
        results, bias_score = compute_bias_metrics(df, job.target_column, job.sensitive_columns)
        for r in results:
            db.add(BiasResult(job_id=job.id, metric_name=r["metric_name"], metric_value=r["metric_value"], threshold=r["threshold"], passed=r["passed"]))
        job.bias_score = str(bias_score)
        job.status = "done"
        job.finished_at = datetime.datetime.utcnow()
        db.commit()
        recs = generate_recommendations(results)
        pdf_path = generate_pdf_report(str(job_id), bias_score, results, recs)
        db.add(Report(job_id=job.id, pdf_path=pdf_path, recommendations=recs))
        db.commit()
    except Exception as e:
        job.status = "failed"
        db.commit()
        raise e
    finally:
        db.close()