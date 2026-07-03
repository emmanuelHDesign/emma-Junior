"""
ZION STOCK OS - Stock & Movement Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class MovementType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUST = "ADJUST"


class StockBase(BaseModel):
    """Base stock schema"""
    warehouse_id: UUID
    product_id: UUID
    quantity: int = 0


class StockCreate(StockBase):
    """Stock creation schema"""
    pass


class StockUpdate(BaseModel):
    """Stock update schema"""
    quantity: int


class StockResponse(StockBase):
    """Stock response schema"""
    id: UUID
    last_updated: datetime

    class Config:
        from_attributes = True


class StockMovementBase(BaseModel):
    """Base stock movement schema"""
    product_id: UUID
    warehouse_id: UUID
    type: MovementType
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = None
    reference: Optional[str] = None


class StockMovementCreate(StockMovementBase):
    """Stock movement creation schema"""
    pass


class StockMovementResponse(StockMovementBase):
    """Stock movement response schema"""
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class StockMovementWithDetails(StockMovementResponse):
    """Stock movement with product and warehouse details"""
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    warehouse_name: Optional[str] = None
    user_name: Optional[str] = None
