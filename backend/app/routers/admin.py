"""
Admin routes — dashboard statistics and user management.
"""

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.booking import Booking
from app.models.payment import Payment
from app.schemas.user import UserResponse

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def get_dashboard_stats(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics.
    Returns total bookings, revenue, occupancy rate, and active users.
    """
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    active_bookings = db.query(func.count(Booking.id)).filter(
        Booking.status == "confirmed"
    ).scalar() or 0

    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed"
    ).scalar() or 0.0

    total_rooms = db.query(func.sum(Room.total_rooms)).scalar() or 1
    occupied_rooms = total_rooms - (db.query(func.sum(Room.available_rooms)).scalar() or 0)
    occupancy_rate = round((occupied_rooms / max(total_rooms, 1)) * 100, 1)

    total_users = db.query(func.count(User.id)).filter(
        User.is_admin == False  # noqa: E712
    ).scalar() or 0

    total_hotels = db.query(func.count(Hotel.id)).scalar() or 0

    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "total_revenue": float(total_revenue),
        "occupancy_rate": occupancy_rate,
        "total_users": total_users,
        "total_hotels": total_hotels,
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all registered users (admin only).
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]
