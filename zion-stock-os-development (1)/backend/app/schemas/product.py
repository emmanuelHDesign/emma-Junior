"""
ZION STOCK OS - Product Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ProductBase(BaseModel):
    """Base product schema"""
    sku: str = Field(..., max_length=100)
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    unit: str = "Pièce"
    unit_price: Decimal = Decimal("0")
    cost_price: Optional[Decimal] = None
    min_stock: int = 10
    image_url: Optional[str] = None
    is_active: bool = True


class ProductCreate(ProductBase):
    """Product creation schema"""
    company_id: UUID


class ProductUpdate(BaseModel):
    """Product update schema"""
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    unit_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    min_stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: UUID
    company_id: UUID
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProductWithStock(ProductResponse):
    """Product with current stock info"""
    total_stock: int = 0
    stock_value: Decimal = Decimal("0")
    stock_status: str = "ok"  # ok, low, out
