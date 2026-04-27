from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dataset import Dataset
from app.utils.auth import get_current_user
from app.config import settings
import pandas as pd, os, uuid, shutil

router = APIRouter()

@router.post("/upload")
def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not file.filename.endswith((".csv", ".json")):
        raise HTTPException(422, "Only CSV/JSON files allowed")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    try:
        df = pd.read_csv(file_path) if file.filename.endswith(".csv") else pd.read_json(file_path)
    except Exception:
        raise HTTPException(422, "Could not parse file")
    dataset = Dataset(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        row_count=len(df),
        column_names=list(df.columns)
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return {"id": str(dataset.id), "filename": dataset.filename, "row_count": dataset.row_count, "columns": dataset.column_names}

@router.get("/")
def list_datasets(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    datasets = db.query(Dataset).filter(Dataset.user_id == current_user.id).all()
    return [{"id": str(d.id), "filename": d.filename, "row_count": d.row_count, "columns": d.column_names} for d in datasets]

@router.get("/{id}")
def get_dataset(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    d = db.query(Dataset).filter(Dataset.id == id).first()
    if not d:
        raise HTTPException(404, "Dataset not found")
    return {"id": str(d.id), "filename": d.filename, "row_count": d.row_count, "columns": d.column_names}