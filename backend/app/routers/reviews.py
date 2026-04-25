"""
Review routes — create and list reviews for hotels.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.hotel import Hotel
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a review for a hotel. One review per user per hotel.
    """
    # Validate rating range
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating must be between 1 and 5"
        )

    # Verify hotel exists
    hotel = db.query(Hotel).filter(Hotel.id == review_data.hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    # Check for existing review
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.hotel_id == review_data.hotel_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this hotel"
        )

    review = Review(
        user_id=current_user.id,
        hotel_id=review_data.hotel_id,
        rating=review_data.rating,
        comment=review_data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        hotel_id=review.hotel_id,
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        user_name=current_user.name,
    )


@router.get("/hotel/{hotel_id}", response_model=List[ReviewResponse])
def get_hotel_reviews(hotel_id: int, db: Session = Depends(get_db)):
    """
    Get all reviews for a specific hotel.
    """
    reviews = db.query(Review).filter(Review.hotel_id == hotel_id).all()
    result = []
    for r in reviews:
        result.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            hotel_id=r.hotel_id,
            rating=r.rating,
            comment=r.comment,
            created_at=r.created_at,
            user_name=r.user.name if r.user else None,
        ))
    return result
