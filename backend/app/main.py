"""
Hotel Booking System — FastAPI Application Entry Point

This is the main application file that:
- Creates the FastAPI app with CORS middleware
- Includes all API routers
- Creates database tables on startup
- Seeds initial data (hotels, rooms, admin user)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, hotels, rooms, bookings, reviews, admin

# Import all models so Base.metadata knows about them
from app.models import User, Hotel, Room, Booking, Payment, Review  # noqa: F401

# Create FastAPI application
app = FastAPI(
    title="Hotel Booking System",
    description="A premium hotel booking platform — DBMS Mini Project",
    version="1.0.0",
)

# CORS middleware — allows frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(auth.router)
app.include_router(hotels.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    """Create all database tables on application startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "message": "Hotel Booking System API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    """API health check."""
    return {"status": "healthy"}
