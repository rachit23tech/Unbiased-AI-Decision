from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.report import Report
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/{job_id}")
def get_report(job_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    report = db.query(Report).filter(Report.job_id == job_id).first()
    if not report:
        raise HTTPException(404, "Report not found")
    return {"job_id": job_id, "recommendations": report.recommendations, "created_at": str(report.created_at)}

@router.get("/{job_id}/pdf")
def download_pdf(job_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    report = db.query(Report).filter(Report.job_id == job_id).first()
    if not report or not report.pdf_path:
        raise HTTPException(404, "PDF not found")
    return FileResponse(report.pdf_path, media_type="application/pdf", filename=f"bias_report_{job_id}.pdf")