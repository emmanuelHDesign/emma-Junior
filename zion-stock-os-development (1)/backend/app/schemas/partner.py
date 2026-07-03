"""
ZION STOCK OS - Supplier & Customer Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


# Supplier Schemas
class SupplierBase(BaseModel):
    """Base supplier schema"""
    name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    """Supplier creation schema"""
    company_id: UUID


class SupplierUpdate(BaseModel):
    """Supplier update schema"""
    name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase):
    """Supplier response schema"""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Customer Schemas
class CustomerBase(BaseModel):
    """Base customer schema"""
    name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_active: bool = True


class CustomerCreate(CustomerBase):
    """Customer creation schema"""
    company_id: UUID


class CustomerUpdate(BaseModel):
    """Customer update schema"""
    name: Optional[str] = None
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class CustomerResponse(CustomerBase):
    """Customer response schema"""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
