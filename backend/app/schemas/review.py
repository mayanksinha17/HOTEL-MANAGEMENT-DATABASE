"""
Review schemas — request/response models for hotel reviews.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ReviewCreate(BaseModel):
    """Schema for creating a review."""
    hotel_id: int
    rating: int  # 1-5
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    """Schema for returning review data."""
    id: int
    user_id: int
    hotel_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
