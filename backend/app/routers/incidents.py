from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/incidents",
    tags=["Incidents"]
)

@router.get("", response_model=List[schemas.Incident])
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).all()
    return incidents
