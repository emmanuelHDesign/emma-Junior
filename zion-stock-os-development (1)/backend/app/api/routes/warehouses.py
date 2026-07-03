"""
ZION STOCK OS - Warehouse Routes
"""
from typing import List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from decimal import Decimal

from app.models.warehouse import Warehouse
from app.models.stock import Stock
from app.models.product import Product
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse, WarehouseWithStats
from app.api.deps import CurrentUser, AdminUser, ManagerUser, DBSession, check_company_access

router = APIRouter()


@router.get("/", response_model=List[WarehouseWithStats])
async def list_warehouses(
    current_user: CurrentUser,
    db: DBSession,
    is_active: bool = None
):
    """
    List all warehouses in company with stats
    """
    query = select(Warehouse).where(Warehouse.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.where(Warehouse.is_active == is_active)
    
    query = query.order_by(Warehouse.name)
    
    result = await db.execute(query)
    warehouses = result.scalars().all()
    
    # Get stats for each warehouse
    warehouse_stats = []
    for wh in warehouses:
        # Count products and total items
        stats_query = select(
            func.count(Stock.id).label('product_count'),
            func.coalesce(func.sum(Stock.quantity), 0).label('total_items')
        ).where(Stock.warehouse_id == wh.id, Stock.quantity > 0)
        
        stats_result = await db.execute(stats_query)
        stats = stats_result.first()
        
        # Calculate total value
        value_query = select(
            func.coalesce(func.sum(Stock.quantity * Product.unit_price), 0)
        ).join(Product, Stock.product_id == Product.id
        ).where(Stock.warehouse_id == wh.id)
        
        value_result = await db.execute(value_query)
        total_value = value_result.scalar() or Decimal(0)
        
        wh_data = WarehouseWithStats(
            **WarehouseResponse.model_validate(wh).model_dump(),
            total_products=stats.product_count if stats else 0,
            total_items=int(stats.total_items) if stats else 0,
            total_value=float(total_value)
        )
        warehouse_stats.append(wh_data)
    
    return warehouse_stats


@router.post("/", response_model=WarehouseResponse)
async def create_warehouse(
    warehouse_in: WarehouseCreate,
    current_user: AdminUser,
    db: DBSession
):
    """
    Create a new warehouse (admin only)
    """
    # Check company access
    if not check_company_access(current_user, warehouse_in.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    warehouse = Warehouse(**warehouse_in.model_dump())
    db.add(warehouse)
    await db.commit()
    await db.refresh(warehouse)
    
    return WarehouseResponse.model_validate(warehouse)


@router.get("/{warehouse_id}", response_model=WarehouseWithStats)
async def get_warehouse(
    warehouse_id: UUID,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Get warehouse by ID with stats
    """
    result = await db.execute(
        select(Warehouse).where(Warehouse.id == warehouse_id)
    )
    warehouse = result.scalar_one_or_none()
    
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepôt non trouvé"
        )
    
    if not check_company_access(current_user, warehouse.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Get stats
    stats_query = select(
        func.count(Stock.id).label('product_count'),
        func.coalesce(func.sum(Stock.quantity), 0).label('total_items')
    ).where(Stock.warehouse_id == warehouse_id, Stock.quantity > 0)
    
    stats_result = await db.execute(stats_query)
    stats = stats_result.first()
    
    # Calculate total value
    value_query = select(
        func.coalesce(func.sum(Stock.quantity * Product.unit_price), 0)
    ).join(Product, Stock.product_id == Product.id
    ).where(Stock.warehouse_id == warehouse_id)
    
    value_result = await db.execute(value_query)
    total_value = value_result.scalar() or Decimal(0)
    
    return WarehouseWithStats(
        **WarehouseResponse.model_validate(warehouse).model_dump(),
        total_products=stats.product_count if stats else 0,
        total_items=int(stats.total_items) if stats else 0,
        total_value=float(total_value)
    )


@router.patch("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: UUID,
    warehouse_in: WarehouseUpdate,
    current_user: AdminUser,
    db: DBSession
):
    """
    Update warehouse (admin only)
    """
    result = await db.execute(
        select(Warehouse).where(Warehouse.id == warehouse_id)
    )
    warehouse = result.scalar_one_or_none()
    
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepôt non trouvé"
        )
    
    if not check_company_access(current_user, warehouse.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    update_data = warehouse_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(warehouse, field, value)
    
    await db.commit()
    await db.refresh(warehouse)
    
    return WarehouseResponse.model_validate(warehouse)


@router.delete("/{warehouse_id}")
async def delete_warehouse(
    warehouse_id: UUID,
    current_user: AdminUser,
    db: DBSession
):
    """
    Delete warehouse (admin only)
    """
    result = await db.execute(
        select(Warehouse).where(Warehouse.id == warehouse_id)
    )
    warehouse = result.scalar_one_or_none()
    
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepôt non trouvé"
        )
    
    if not check_company_access(current_user, warehouse.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    await db.delete(warehouse)
    await db.commit()
    
    return {"message": "Entrepôt supprimé"}
