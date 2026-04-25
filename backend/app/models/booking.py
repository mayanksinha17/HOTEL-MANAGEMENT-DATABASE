"""
Booking model — stores reservation records linking users to rooms.
Tracks check-in/out dates, status, and total price.
"""

from sqlalchemy import (
    Column, Integer, String, Float, ForeignKey, DateTime, Date, Text, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    room_id = Column(
        Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True
    )
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(
        String(20), nullable=False, default="confirmed"
    )  # confirmed, completed, cancelled
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Table-level constraints
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="check_dates_valid"),
        CheckConstraint("guests > 0", name="guests_positive"),
        CheckConstraint("total_price >= 0", name="price_non_negative"),
        CheckConstraint(
            "status IN ('confirmed', 'completed', 'cancelled')",
            name="valid_status"
        ),
    )

    # Relationships
    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Booking(id={self.id}, user={self.user_id}, status='{self.status}')>"
