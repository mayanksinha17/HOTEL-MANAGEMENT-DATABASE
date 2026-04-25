"""
Hotel model — stores hotel information including location, rating, and amenities.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=False, default="India")
    star_rating = Column(Integer, nullable=False, default=3)  # 1-5 stars
    price_per_night = Column(Float, nullable=False)  # Base price (minimum room price)
    image_url = Column(String(500), nullable=True)
    amenities = Column(ARRAY(String), nullable=True)  # e.g. ["WiFi", "Pool", "Parking"]
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="hotel", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Hotel(id={self.id}, name='{self.name}', city='{self.city}')>"
