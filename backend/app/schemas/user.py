"""
User schemas — request/response models for authentication and user management.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# --- Request Schemas ---

class UserRegister(BaseModel):
    """Schema for user registration."""
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    is_admin: Optional[bool] = False


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = None
    phone: Optional[str] = None


# --- Response Schemas ---

class UserResponse(BaseModel):
    """Schema for returning user data (excludes password)."""
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True  # Allows creating from SQLAlchemy model


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
