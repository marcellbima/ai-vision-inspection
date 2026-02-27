from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InspectionResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    result: str
    confidence: float
    defect_type: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
