from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/routes",
    tags=["Routes"]
)

@router.get("", response_model=List[schemas.Route])
def get_routes(db: Session = Depends(get_db)):
    routes = db.query(models.Route).all()
    return routes
