from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import httpx, shutil, os, uuid
from app.db.database import get_db
from app.db.models import Inspection, User
from app.schemas.inspection import InspectionResponse
from app.api.auth import get_current_user

router = APIRouter()
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/predict", response_model=InspectionResponse)
async def predict(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Save uploaded image
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Call AI service
    async with httpx.AsyncClient(timeout=30) as client:
        with open(filepath, "rb") as f:
            response = await client.post(
                "http://ai-service:8001/predict",
                files={"file": (filename, f, "image/jpeg")}
            )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="AI service error")

    ai_result = response.json()

    # Save to DB
    inspection = Inspection(
        user_id=current_user.id,
        image_path=filename,
        result=ai_result["result"],
        confidence=ai_result["confidence"],
        defect_type=ai_result.get("defect_type")
    )
    db.add(inspection)
    db.commit()
    db.refresh(inspection)
    return inspection

@router.get("/history", response_model=List[InspectionResponse])
def get_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Inspection)
    if current_user.role == "operator":
        query = query.filter(Inspection.user_id == current_user.id)
    return query.order_by(Inspection.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if current_user.role == "operator" and inspection.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return inspection
