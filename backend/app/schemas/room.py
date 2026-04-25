"""
Room schemas — request/response models for room management.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class RoomCreate(BaseModel):
    """Schema for creating a new room type in a hotel (admin only)."""
    hotel_id: int
    room_type: str
    description: Optional[str] = None
    price_per_night: float
    capacity: int = 2
    bed_type: str = "Double"
    total_rooms: int = 1
    available_rooms: int = 1
    image_url: Optional[str] = None


class RoomUpdate(BaseModel):
    """Schema for updating room details."""
    room_type: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None
    bed_type: Optional[str] = None
    total_rooms: Optional[int] = None
    available_rooms: Optional[int] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None


class RoomResponse(BaseModel):
    """Schema for returning room data."""
    id: int
    hotel_id: int
    room_type: str
    description: Optional[str] = None
    price_per_night: float
    capacity: int
    bed_type: str
    total_rooms: int
    available_rooms: int
    image_url: Optional[str] = None
    is_available: bool
    created_at: datetime

    class Config:
        from_attributes = True
