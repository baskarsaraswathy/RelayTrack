from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import models

router = APIRouter(
    prefix="/api/sync",
    tags=["Sync"]
)

class SyncAction(BaseModel):
    id: str
    type: str
    payload: Dict[str, Any]
    createdAt: int
    retryCount: int

@router.post("/action")
def sync_action(action: SyncAction, db: Session = Depends(get_db)):
    if action.type == "dispatch_route":
        tracking_number = action.payload.get("trackingNumber")
        if not tracking_number:
            raise HTTPException(status_code=400, detail="Missing trackingNumber in payload")
            
        package = db.query(models.Package).filter(models.Package.tracking_number == tracking_number).first()
        if package:
            # Genuinely persist the offline action by updating the existing schema
            package.status = "REROUTED"
            package.risk_level = "LOW"
            db.commit()
            return {"status": "success", "action_id": action.id, "message": f"Package {tracking_number} rerouted in database."}
        else:
            raise HTTPException(status_code=404, detail="Package not found")

    return {"status": "success", "action_id": action.id, "message": "Action synchronized but no DB change required."}
