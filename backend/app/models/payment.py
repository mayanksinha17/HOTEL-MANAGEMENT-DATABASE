"""
Payment model — stores payment records for bookings.
Simulates payment processing (no real payment gateway).
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(
        Integer, ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False, unique=True, index=True
    )
    amount = Column(Float, nullable=False)
    payment_method = Column(
        String(50), nullable=False, default="credit_card"
    )  # credit_card, debit_card, upi, net_banking
    transaction_id = Column(String(100), unique=True, nullable=False)  # Simulated txn ID
    status = Column(
        String(20), nullable=False, default="completed"
    )  # pending, completed, failed, refunded
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    booking = relationship("Booking", back_populates="payment")

    def __repr__(self):
        return f"<Payment(id={self.id}, booking={self.booking_id}, status='{self.status}')>"
