from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Numeric, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Hub(Base):
    __tablename__ = "hubs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String)
    lat = Column("latitude", Float)
    lng = Column("longitude", Float)
    created_at = Column(DateTime, default=datetime.utcnow)

class Route(Base):
    __tablename__ = "routes"
    id = Column(Integer, primary_key=True, index=True)
    source_hub_id = Column(Integer, ForeignKey("hubs.id"))
    destination_hub_id = Column(Integer, ForeignKey("hubs.id"))
    distance = Column("distance_km", Float)
    duration = Column("normal_travel_minutes", Integer)
    current_travel_minutes = Column(Integer)
    traffic_level = Column(String)
    weather_status = Column(String)
    is_active = Column(Boolean)
    created_at = Column(DateTime, default=datetime.utcnow)
    
class Package(Base):
    __tablename__ = "packages"
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    status = Column(String)
    risk_level = Column(String)
    origin_hub_id = Column(Integer, ForeignKey("hubs.id"))
    destination_hub_id = Column(Integer, ForeignKey("hubs.id"))
    current_hub_id = Column(Integer, ForeignKey("hubs.id"), nullable=True)
    deadline = Column(DateTime)
    eta = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PackageLocation(Base):
    __tablename__ = "package_locations"
    id = Column(Integer, primary_key=True, index=True)
    package_id = Column(Integer, ForeignKey("packages.id"))
    hub_id = Column(Integer, ForeignKey("hubs.id"))
    lat = Column("latitude", Float)
    lng = Column("longitude", Float)
    timestamp = Column("recorded_at", DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"))
    type = Column(String)
    description = Column(Text)
    severity = Column(String)
    delay_minutes = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class RFIDEvent(Base):
    __tablename__ = "rfid_events"
    id = Column(Integer, primary_key=True, index=True)
    scanner_id = Column(String)
    package_id = Column(Integer, ForeignKey("packages.id"))
    hub_id = Column(Integer, ForeignKey("hubs.id"))
    event_type = Column(String)
    timestamp = Column("created_at", DateTime, default=datetime.utcnow)
