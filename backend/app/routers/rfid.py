from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/rfid-events",
    tags=["RFID"]
)

@router.get("", response_model=List[schemas.RFIDEvent])
def get_rfid_events(db: Session = Depends(get_db)):
    events = db.query(models.RFIDEvent).all()
    return events
