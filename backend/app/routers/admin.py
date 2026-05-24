"""
Admin routes — dashboard statistics and user management.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, text

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


# ---------------------------------------------------------------------------
# Advanced Raw-SQL Endpoints
# ---------------------------------------------------------------------------


@router.get("/profit/yearly")
def get_yearly_profit(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Yearly profit report grouped by hotel and month.
    Uses raw SQL with JOINs, GROUP BY, HAVING, and aggregate functions.
    """
    sql = text("""
        SELECT
            h.name                  AS hotel_name,
            EXTRACT(MONTH FROM b.check_in)::INTEGER AS month,
            COUNT(b.id)             AS total_bookings,
            ROUND(SUM(p.amount)::NUMERIC, 2) AS gross_revenue,
            ROUND(SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END)::NUMERIC, 2) AS refunds,
            ROUND(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END)::NUMERIC, 2) AS net_profit
        FROM bookings b
            JOIN payments p ON p.booking_id = b.id
            JOIN rooms   r ON r.id = b.room_id
            JOIN hotels  h ON h.id = r.hotel_id
        WHERE EXTRACT(YEAR FROM b.check_in) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY h.name, EXTRACT(MONTH FROM b.check_in)
        HAVING SUM(p.amount) > 0
        ORDER BY h.name, month
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


@router.get("/pricing/holiday/preview")
def preview_holiday_pricing(
    surge_pct: float = Query(25.0, description="Surge percentage to preview"),
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Preview holiday-season dynamic pricing without applying changes.
    Uses parameterised raw SQL with arithmetic expressions.
    """
    sql = text("""
        SELECT
            h.name AS hotel_name,
            r.room_type,
            ROUND(r.price_per_night::NUMERIC, 2) AS current_price,
            ROUND((r.base_price * (1 + :surge_pct / 100.0))::NUMERIC, 2) AS holiday_price,
            ROUND((r.base_price * (1 + :surge_pct / 100.0) - r.price_per_night)::NUMERIC, 2) AS price_increase
        FROM rooms r
            JOIN hotels h ON h.id = r.hotel_id
        ORDER BY h.name, r.price_per_night
    """)
    result = db.execute(sql, {"surge_pct": surge_pct})
    return [dict(row) for row in result.mappings().all()]


class HolidayPricingRequest(BaseModel):
    surge_pct: float
    hotel_id: Optional[int] = None


@router.post("/pricing/holiday")
def apply_holiday_pricing(
    body: HolidayPricingRequest,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Apply holiday-season surge pricing to rooms.
    Optionally scoped to a single hotel via hotel_id.
    """
    sql = text("""
        UPDATE rooms
        SET price_per_night = ROUND((base_price * (1 + :surge_pct / 100.0))::NUMERIC, 2)
        WHERE (:hotel_id IS NULL OR hotel_id = :hotel_id)
    """)
    result = db.execute(sql, {"surge_pct": body.surge_pct, "hotel_id": body.hotel_id})
    db.commit()
    return {
        "message": "Holiday pricing applied successfully",
        "rooms_updated": result.rowcount,
        "surge_pct": body.surge_pct,
    }


@router.get("/analytics/hotel-ranking")
def get_hotel_ranking(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Hotel revenue ranking using CTEs, window functions (RANK, NULLIF),
    and occupancy/revenue-share calculations.
    """
    sql = text("""
        WITH hotel_rooms AS (
            SELECT hotel_id, SUM(total_rooms) AS total_rooms
            FROM rooms
            GROUP BY hotel_id
        ),
        hotel_stats AS (
            SELECT
                h.id, h.name, h.city, h.star_rating,
                COUNT(DISTINCT b.id)  AS total_bookings,
                COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS total_revenue,
                ROUND(AVG(CASE WHEN p.status = 'completed' THEN p.amount END)::NUMERIC, 2)  AS avg_booking_value
            FROM hotels h
                LEFT JOIN rooms    r ON r.hotel_id = h.id
                LEFT JOIN bookings b ON b.room_id  = r.id AND b.status != 'cancelled'
                LEFT JOIN payments p ON p.booking_id = b.id
            GROUP BY h.id, h.name, h.city, h.star_rating
        )
        SELECT
            RANK() OVER (ORDER BY s.total_revenue DESC) AS revenue_rank,
            s.name, s.city, s.star_rating, s.total_bookings, s.total_revenue, s.avg_booking_value,
            CASE 
                WHEN s.total_bookings = 0 THEN 0.0
                ELSE LEAST(100.0, ROUND(((s.total_bookings * 2.5) / NULLIF(hr.total_rooms, 0) * 100)::NUMERIC, 1))
            END AS occupancy_pct,
            ROUND((s.total_revenue::FLOAT / NULLIF((SELECT SUM(total_revenue) FROM hotel_stats), 0) * 100)::NUMERIC, 1) AS revenue_share_pct
        FROM hotel_stats s
        JOIN hotel_rooms hr ON hr.hotel_id = s.id
        ORDER BY revenue_rank
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]


@router.get("/analytics/booking-trends")
def get_booking_trends(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Monthly booking trends with moving averages, cumulative revenue,
    and month-over-month growth. Uses CTEs, LAG, and window frames.
    """
    sql = text("""
        WITH monthly_data AS (
            SELECT
                DATE_TRUNC('month', b.check_in)::DATE AS month,
                COUNT(b.id)                            AS bookings,
                COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS revenue
            FROM bookings b
                LEFT JOIN payments p ON p.booking_id = b.id
            WHERE b.status != 'cancelled'
            GROUP BY DATE_TRUNC('month', b.check_in)
        ),
        trend AS (
            SELECT
                month, bookings, revenue,
                LAG(revenue, 1) OVER (ORDER BY month)                                                   AS prev_month_revenue,
                ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)::NUMERIC, 2) AS moving_avg_3m,
                SUM(revenue) OVER (ORDER BY month)                                                      AS cumulative_revenue
            FROM monthly_data
        )
        SELECT
            TO_CHAR(month, 'Mon YYYY') AS period,
            bookings,
            revenue,
            moving_avg_3m,
            cumulative_revenue,
            CASE WHEN prev_month_revenue > 0
                THEN ROUND(((revenue - prev_month_revenue) / prev_month_revenue * 100)::NUMERIC, 1)
                ELSE NULL
            END AS growth_pct
        FROM trend
        ORDER BY month
    """)
    result = db.execute(sql)
    return [dict(row) for row in result.mappings().all()]
