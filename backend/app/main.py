from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, hubs, routes, packages, risks, incidents, rfid, sync
from app.database import engine, Base

app = FastAPI(
    title="RelayTrack API",
    description="Backend API for RelayTrack - Smart Delivery & Delay Tracker",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://relaytrack-frontend-baskar.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
def root():
    return {
        "message": "Welcome to RelayTrack API",
        "status": "running"
    }

# Include routers
app.include_router(health.router)
app.include_router(hubs.router)
app.include_router(routes.router)
app.include_router(packages.router)
app.include_router(risks.router)
app.include_router(incidents.router)
app.include_router(rfid.router)
app.include_router(sync.router)