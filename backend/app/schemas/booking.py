"""
Booking schemas — request/response models for reservation management.
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.schemas.room import RoomResponse


class BookingCreate(BaseModel):
    """Schema for creating a new booking."""
    room_id: int
    check_in: date
    check_out: date
    guests: int = 1
    special_requests: Optional[str] = None
    payment_method: str = "credit_card"


class BookingResponse(BaseModel):
    """Schema for returning booking data."""
    id: int
    user_id: int
    room_id: int
    check_in: date
    check_out: date
    guests: int
    total_price: float
    status: str
    special_requests: Optional[str] = None
    created_at: datetime
    room: Optional[RoomResponse] = None

    class Config:
        from_attributes = True


class BookingWithHotel(BookingResponse):
    """Extended booking response that includes hotel name."""
    hotel_name: Optional[str] = None
    hotel_image: Optional[str] = None
    room_type: Optional[str] = None
