from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/hubs",
    tags=["Hubs"]
)

@router.get("", response_model=List[schemas.Hub])
def get_hubs(db: Session = Depends(get_db)):
    hubs = db.query(models.Hub).all()
    return hubs
