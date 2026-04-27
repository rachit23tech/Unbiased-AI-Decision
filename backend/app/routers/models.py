from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ml_model import MLModel
from app.utils.auth import get_current_user
from app.config import settings
import os, uuid, shutil

router = APIRouter()

@router.post("/upload")
def upload_model(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    model = MLModel(user_id=current_user.id, filename=file.filename, file_path=file_path)
    db.add(model)
    db.commit()
    db.refresh(model)
    return {"model_id": str(model.id), "filename": model.filename}