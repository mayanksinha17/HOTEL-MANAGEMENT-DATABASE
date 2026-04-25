"""
Booking routes — create, list, and cancel bookings.
Includes payment simulation.
"""

import uuid
from typing import List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.room import Room
from app.models.booking import Booking
from app.models.payment import Payment
from app.schemas.booking import BookingCreate, BookingResponse, BookingWithHotel

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new booking with payment simulation.
    Validates dates, room availability, and guest capacity.
    """
    # Validate dates
    if booking_data.check_in >= booking_data.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    if booking_data.check_in < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past"
        )

    # Get room and validate
    room = db.query(Room).filter(Room.id == booking_data.room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    if not room.is_available or room.available_rooms <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available"
        )
    if booking_data.guests > room.capacity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room capacity is {room.capacity} guests"
        )

    # Calculate total price (number of nights × price per night)
    num_nights = (booking_data.check_out - booking_data.check_in).days
    total_price = num_nights * room.price_per_night

    # Create booking
    booking = Booking(
        user_id=current_user.id,
        room_id=booking_data.room_id,
        check_in=booking_data.check_in,
        check_out=booking_data.check_out,
        guests=booking_data.guests,
        total_price=total_price,
        special_requests=booking_data.special_requests,
        status="confirmed",
    )
    db.add(booking)

    # Decrease available rooms
    room.available_rooms -= 1
    if room.available_rooms <= 0:
        room.is_available = False

    db.flush()  # Get booking ID without committing

    # Create simulated payment
    payment = Payment(
        booking_id=booking.id,
        amount=total_price,
        payment_method=booking_data.payment_method,
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        status="completed",
    )
    db.add(payment)

    db.commit()
    db.refresh(booking)

    return BookingResponse.model_validate(booking)


@router.get("/my", response_model=List[BookingWithHotel])
def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all bookings for the current user, with hotel details.
    """
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.room))
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []
    for b in bookings:
        booking_dict = BookingResponse.model_validate(b).model_dump()
        booking_dict["hotel_name"] = b.room.hotel.name if b.room and b.room.hotel else None
        booking_dict["hotel_image"] = b.room.hotel.image_url if b.room and b.room.hotel else None
        booking_dict["room_type"] = b.room.room_type if b.room else None
        result.append(BookingWithHotel(**booking_dict))

    return result


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel a booking. Only the booking owner can cancel.
    Restores room availability and marks payment as refunded.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    if booking.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings"
        )
    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )
    if booking.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot cancel a completed booking"
        )

    # Cancel booking
    booking.status = "cancelled"

    # Restore room availability
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.available_rooms += 1
        room.is_available = True

    # Mark payment as refunded
    if booking.payment:
        booking.payment.status = "refunded"

    db.commit()
    db.refresh(booking)
    return BookingResponse.model_validate(booking)


# --- Admin Routes ---

@router.get("/all", response_model=List[BookingWithHotel])
def get_all_bookings(
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all bookings (admin only).
    """
    bookings = (
        db.query(Booking)
        .options(joinedload(Booking.room).joinedload(Room.hotel))
        .options(joinedload(Booking.user))
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []
    for b in bookings:
        booking_dict = BookingResponse.model_validate(b).model_dump()
        booking_dict["hotel_name"] = b.room.hotel.name if b.room and b.room.hotel else None
        booking_dict["hotel_image"] = b.room.hotel.image_url if b.room and b.room.hotel else None
        booking_dict["room_type"] = b.room.room_type if b.room else None
        booking_dict["user_name"] = b.user.name if b.user else None
        booking_dict["user_email"] = b.user.email if b.user else None
        result.append(BookingWithHotel(**booking_dict))

    return result
