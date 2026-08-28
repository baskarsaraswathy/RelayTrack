from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
import heapq
from datetime import datetime

from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter(
    prefix="/api/packages",
    tags=["Packages"]
)

def compute_package_risk(package, route, incidents) -> str:
    # Basic Risk Intelligence Logic
    risk_level = "LOW"
    if not route:
        return risk_level

    # Check for incidents on route
    for inc in incidents:
        if inc.route_id == route.id:
            if inc.severity == "HIGH":
                return "CRITICAL"
            if inc.severity == "MEDIUM":
                risk_level = "HIGH"
                
    # Check traffic and weather
    if risk_level != "CRITICAL" and risk_level != "HIGH":
        if route.traffic_level == "HIGH" or route.weather_status == "STORM":
            risk_level = "HIGH"
        elif route.traffic_level == "MODERATE":
            risk_level = "MEDIUM"

    # ETA vs Deadline
    if package.eta and package.deadline:
        eta_time = package.eta
        deadline_time = package.deadline
        if eta_time > deadline_time:
            diff = (eta_time - deadline_time).total_seconds() / 60
            if diff > 60:
                risk_level = "CRITICAL"
            elif diff > 30 and risk_level != "CRITICAL":
                risk_level = "HIGH"
            elif risk_level == "LOW":
                risk_level = "MEDIUM"

    return risk_level

@router.get("", response_model=List[schemas.Package])
def get_packages(db: Session = Depends(get_db)):
    packages = db.query(models.Package).all()
    routes = db.query(models.Route).all()
    incidents = db.query(models.Incident).all()

    # Create a map for quick route lookup
    route_map = {}
    for r in routes:
        route_map[(r.source_hub_id, r.destination_hub_id)] = r
        route_map[(r.destination_hub_id, r.source_hub_id)] = r # bi-directional assume

    for p in packages:
        # Find active route
        curr_route = route_map.get((p.fromId if hasattr(p, 'fromId') else p.origin_hub_id, p.destination_hub_id))
        if not curr_route and p.current_hub_id:
             curr_route = route_map.get((p.current_hub_id, p.destination_hub_id))
        
        computed_risk = compute_package_risk(p, curr_route, incidents)
        
        # Override object attribute just for the response
        p.risk_level = computed_risk

    return packages

@router.get("/{tracking_number}", response_model=schemas.Package)
def get_package(tracking_number: str, db: Session = Depends(get_db)):
    package = db.query(models.Package).filter(models.Package.tracking_number == tracking_number).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package

@router.get("/{tracking_number}/route-planner", response_model=schemas.RoutePlan)
def route_planner(tracking_number: str, db: Session = Depends(get_db)):
    package = db.query(models.Package).filter(models.Package.tracking_number == tracking_number).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    start_hub = package.current_hub_id or package.origin_hub_id
    end_hub = package.destination_hub_id

    routes = db.query(models.Route).filter(models.Route.is_active == True).all()
    hubs = db.query(models.Hub).all()
    incidents = db.query(models.Incident).all()
    
    hub_name_map = {h.id: h.name for h in hubs}
    
    # Build graph
    graph: Dict[int, List[tuple]] = {h.id: [] for h in hubs}
    
    # Track original route cost/risk
    for r in routes:
        # Heavily penalize high traffic or incidents
        base_cost = r.current_travel_minutes or r.normal_travel_minutes or 60
        penalty = 0
        if r.traffic_level == "HIGH": penalty += 120
        if r.weather_status == "STORM": penalty += 200
        
        for inc in incidents:
            if inc.route_id == r.id:
                penalty += (inc.delay_minutes or 60)
                
        total_cost = base_cost + penalty
        
        # Add edges (assuming bi-directional for graph traversal)
        if r.source_hub_id in graph and r.destination_hub_id in graph:
            graph[r.source_hub_id].append((r.destination_hub_id, total_cost))
            graph[r.destination_hub_id].append((r.source_hub_id, total_cost))

    # Dijkstra's Algorithm
    queue = [(0, start_hub, [])]
    visited = set()
    best_path = []
    
    while queue:
        cost, curr, path = heapq.heappop(queue)
        
        if curr in visited:
            continue
            
        visited.add(curr)
        path = path + [curr]
        
        if curr == end_hub:
            best_path = path
            break
            
        for neighbor, weight in graph[curr]:
            if neighbor not in visited:
                heapq.heappush(queue, (cost + weight, neighbor, path))
                
    if not best_path:
        return schemas.RoutePlan(
            tracking_number=tracking_number,
            original_route_risk="CRITICAL",
            recommended_path=[],
            recommended_path_names=[],
            reason="No viable alternative route found."
        )

    return schemas.RoutePlan(
        tracking_number=tracking_number,
        original_route_risk=package.risk_level or "HIGH",
        recommended_path=best_path,
        recommended_path_names=[hub_name_map.get(hid, str(hid)) for hid in best_path],
        reason=f"Bypassing delays. Recommended path saves estimated time by navigating around active traffic or incidents."
    )
