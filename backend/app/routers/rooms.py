"""
Room routes — list rooms by hotel and CRUD operations.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.room import Room
from app.models.hotel import Hotel
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])


@router.get("/hotel/{hotel_id}", response_model=List[RoomResponse])
def get_rooms_by_hotel(hotel_id: int, db: Session = Depends(get_db)):
    """
    Get all rooms for a specific hotel.
    """
    # Verify hotel exists
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    rooms = db.query(Room).filter(Room.hotel_id == hotel_id).all()
    return [RoomResponse.model_validate(r) for r in rooms]


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    """
    Get details of a specific room.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return RoomResponse.model_validate(room)


# --- Admin Routes ---

@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room_data: RoomCreate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Create a new room type in a hotel (admin only).
    """
    # Verify hotel exists
    hotel = db.query(Hotel).filter(Hotel.id == room_data.hotel_id).first()
    if not hotel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hotel not found"
        )

    room = Room(**room_data.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return RoomResponse.model_validate(room)


@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_data: RoomUpdate,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update room details (admin only).
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    update_data = room_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return RoomResponse.model_validate(room)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    admin=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a room (admin only).
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    db.delete(room)
    db.commit()
    return None
