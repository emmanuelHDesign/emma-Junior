"""
ZION STOCK OS - Warehouse Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class WarehouseBase(BaseModel):
    """Base warehouse schema"""
    name: str
    location: Optional[str] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool = True


class WarehouseCreate(WarehouseBase):
    """Warehouse creation schema"""
    company_id: UUID


class WarehouseUpdate(BaseModel):
    """Warehouse update schema"""
    name: Optional[str] = None
    location: Optional[str] = None
    manager_name: Optional[str] = None
    phone: Optional[str] = None
    is_active: Optional[bool] = None


class WarehouseResponse(WarehouseBase):
    """Warehouse response schema"""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class WarehouseWithStats(WarehouseResponse):
    """Warehouse with stock statistics"""
    total_products: int = 0
    total_items: int = 0
    total_value: float = 0.0
