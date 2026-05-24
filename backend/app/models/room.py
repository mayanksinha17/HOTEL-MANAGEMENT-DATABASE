"""
Room model — stores room types within a hotel.
Each hotel can have multiple room types (Deluxe, Suite, etc.)
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    hotel_id = Column(
        Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True
    )
    room_type = Column(String(100), nullable=False)  # e.g. "Deluxe", "Suite", "Standard"
    description = Column(Text, nullable=True)
    price_per_night = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False, default=2)  # Max guests
    bed_type = Column(String(50), nullable=False, default="Double")  # "Single", "Double", "King"
    total_rooms = Column(Integer, nullable=False, default=1)  # Total rooms of this type
    available_rooms = Column(Integer, nullable=False, default=1)  # Currently available
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Room(id={self.id}, type='{self.room_type}', hotel_id={self.hotel_id})>"
