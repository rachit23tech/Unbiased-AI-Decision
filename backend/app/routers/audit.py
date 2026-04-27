from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/")
def get_audit_log(current_user=Depends(get_current_user)):
    return {"events": []}