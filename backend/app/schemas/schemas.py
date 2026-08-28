from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HubBase(BaseModel):
    name: str
    city: Optional[str] = None
    lat: float
    lng: float

class Hub(HubBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    source_hub_id: int
    destination_hub_id: int
    distance: float
    duration: int
    current_travel_minutes: Optional[int] = None
    traffic_level: Optional[str] = None
    weather_status: Optional[str] = None
    is_active: Optional[bool] = None

class Route(RouteBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PackageBase(BaseModel):
    tracking_number: str
    status: str
    risk_level: str
    origin_hub_id: int
    destination_hub_id: int
    current_hub_id: Optional[int] = None
    deadline: Optional[datetime] = None
    eta: Optional[datetime] = None

class Package(PackageBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PackageLocationBase(BaseModel):
    package_id: int
    hub_id: Optional[int] = None
    lat: float
    lng: float

class PackageLocation(PackageLocationBase):
    id: int
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentBase(BaseModel):
    type: str
    description: str
    severity: str
    route_id: Optional[int] = None
    delay_minutes: Optional[int] = None

class Incident(IncidentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RFIDEventBase(BaseModel):
    package_id: int
    hub_id: int
    event_type: str
    scanner_id: Optional[str] = None

class RFIDEvent(RFIDEventBase):
    id: int
    timestamp: Optional[datetime] = None

    class Config:
        from_attributes = True

class RoutePlan(BaseModel):
    tracking_number: str
    original_route_risk: str
    recommended_path: List[int]
    recommended_path_names: List[str]
    reason: str

