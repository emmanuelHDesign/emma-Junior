"""
ZION STOCK OS - User Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MAGASINIER = "magasinier"
    VENDEUR = "vendeur"


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.VENDEUR
    is_active: bool = True
    warehouse_id: Optional[UUID] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str = Field(..., min_length=8)
    company_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    """User update schema"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    warehouse_id: Optional[UUID] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    email: str
    full_name: Optional[str]
    role: UserRole
    is_active: bool
    is_superuser: bool
    company_id: Optional[UUID]
    warehouse_id: Optional[UUID]
    avatar_url: Optional[str]
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserInDB(UserResponse):
    """User with hashed password (internal use)"""
    hashed_password: str
