"""
Review model — stores user reviews and ratings for hotels.
"""

from sqlalchemy import (
    Column, Integer, Text, ForeignKey, DateTime, CheckConstraint, UniqueConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    hotel_id = Column(
        Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Constraints
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="valid_rating"),
        UniqueConstraint("user_id", "hotel_id", name="one_review_per_user_hotel"),
    )

    # Relationships
    user = relationship("User", back_populates="reviews")
    hotel = relationship("Hotel", back_populates="reviews")

    def __repr__(self):
        return f"<Review(id={self.id}, user={self.user_id}, hotel={self.hotel_id}, rating={self.rating})>"
