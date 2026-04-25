"""
Payment schemas — request/response models for payment records.
"""

from datetime import datetime

from pydantic import BaseModel


class PaymentResponse(BaseModel):
    """Schema for returning payment data."""
    id: int
    booking_id: int
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
