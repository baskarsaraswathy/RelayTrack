from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/risk-alerts",
    tags=["Risks"]
)

@router.get("", response_model=List[schemas.Package])
def get_risk_alerts(db: Session = Depends(get_db)):
    risks = db.query(models.Package).filter(models.Package.risk_level == "AT_RISK").all()
    return risks
