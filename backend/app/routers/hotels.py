"""
Hotel routes — search, list, and CRUD operations for hotels.
"""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.hotel import Hotel
from app.models.review import Review
from app.schemas.hotel import HotelCreate, HotelUpdate, HotelResponse

router = APIRouter(prefix="/api/hotels", tags=["Hotels"])


@router.get("/", response_model=List[HotelResponse])
def list_hotels(
    city: Optional[str] = Query(None, description="Filter by city"),
    min_price: Optional[float] = Query(None, description="Minimum price per night"),
    max_price: Optional[float] = Query(None, description="Maximum price per night"),
    star_rating: Optional[int] = Query(None, description="Minimum star rating"),
    amenities: Optional[str] = Query(None, description="Comma-separated amenities"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List and search hotels with optional filters.
    Supports filtering by city, price range, star rating, and amenities.
    """
    query = db.query(Hotel)

    # Apply filters
    if city:
        query = query.filter(Hotel.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.filter(Hotel.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Hotel.price_per_night <= max_price)
    if star_rating is not None:
        query = query.filter(Hotel.star_rating >= star_rating)
    if amenities:
        # Filter hotels that have ALL the requested amenities
        amenity_list = [a.strip() for a in amenities.split(",")]
        for amenity in amenity_list:
            query = query.filter(Hotel.amenities.any(amenity))

    hotels = query.offset(skip).limit(limit).all()
    return [HotelResponse.model_validate(h) for h in hotels]


@router.get("/featured", response_model=List[HotelResponse])
def get_featured_hotels(db: Session = Depends(get_db)):
    """
    Get top 4 featured hotels (highest rated).
    """
    hotels = db.query(Hotel).order_by(Hotel.star_rating.desc()).limit(4).all()
    return [HotelResponse.model_validate(h) for h in hotels]


@router.get("/{hotel_id}", response_model=HotelResponse)
def get_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific hotel.
    """
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )
    return HotelResponse.model_validate(hotel)


# --- Admin Routes ---

@router.post("/", response_model=HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel(
    hotel_data: HotelCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new hotel (admin only).
    """
    hotel = Hotel(**hotel_data.model_dump())
    db.add(hotel)
    db.commit()
    db.refresh(hotel)
    return HotelResponse.model_validate(hotel)


@router.put("/{hotel_id}", response_model=HotelResponse)
def update_hotel(
    hotel_id: int,
    hotel_data: HotelUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update an existing hotel (admin only).
    """
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    # Update only provided fields
    update_data = hotel_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hotel, field, value)

    db.commit()
    db.refresh(hotel)
    return HotelResponse.model_validate(hotel)


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel(
    hotel_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a hotel and all its rooms/bookings (admin only).
    CASCADE delete handles related records.
    """
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    db.delete(hotel)
    db.commit()
    return None
