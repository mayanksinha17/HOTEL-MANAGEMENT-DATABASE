"""
Hotel schemas — request/response models for hotel management.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel


class HotelCreate(BaseModel):
    """Schema for creating a new hotel (admin only)."""
    name: str
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: str = "India"
    star_rating: int = 3
    price_per_night: float
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class HotelUpdate(BaseModel):
    """Schema for updating hotel details."""
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    star_rating: Optional[int] = None
    price_per_night: Optional[float] = None
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = None


class HotelResponse(BaseModel):
    """Schema for returning hotel data."""
    id: int
    name: str
    description: Optional[str] = None
    address: str
    city: str
    state: Optional[str] = None
    country: str
    star_rating: int
    price_per_night: float
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HotelSearchParams(BaseModel):
    """Schema for hotel search query parameters."""
    city: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    star_rating: Optional[int] = None
    amenities: Optional[List[str]] = None
