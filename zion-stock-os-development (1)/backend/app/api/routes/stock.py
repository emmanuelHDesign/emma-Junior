"""
ZION STOCK OS - Stock & Movement Routes
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from datetime import datetime, timezone

from app.models.stock import Stock, StockMovement, MovementType
from app.models.product import Product
from app.models.warehouse import Warehouse
from app.models.user import User
from app.schemas.stock import (
    StockResponse, StockCreate, StockUpdate,
    StockMovementCreate, StockMovementResponse, StockMovementWithDetails
)
from app.api.deps import CurrentUser, ManagerUser, DBSession, check_company_access, check_warehouse_access

router = APIRouter()


@router.get("/inventory", response_model=List[dict])
async def get_inventory(
    current_user: CurrentUser,
    db: DBSession,
    warehouse_id: Optional[UUID] = None
):
    """
    Get inventory with stock per warehouse
    """
    # Get all products for company
    products_query = select(Product).where(
        Product.company_id == current_user.company_id,
        Product.is_active == True
    )
    products_result = await db.execute(products_query)
    products = products_result.scalars().all()
    
    # Get warehouses
    warehouses_query = select(Warehouse).where(
        Warehouse.company_id == current_user.company_id,
        Warehouse.is_active == True
    )
    warehouses_result = await db.execute(warehouses_query)
    warehouses = warehouses_result.scalars().all()
    
    inventory = []
    for product in products:
        stock_by_warehouse = {}
        total_stock = 0
        
        for wh in warehouses:
            if warehouse_id and wh.id != warehouse_id:
                continue
            
            stock_query = select(Stock).where(
                Stock.product_id == product.id,
                Stock.warehouse_id == wh.id
            )
            stock_result = await db.execute(stock_query)
            stock = stock_result.scalar_one_or_none()
            
            qty = stock.quantity if stock else 0
            stock_by_warehouse[str(wh.id)] = {
                "warehouse_name": wh.name,
                "quantity": qty
            }
            total_stock += qty
        
        inventory.append({
            "product_id": str(product.id),
            "sku": product.sku,
            "name": product.name,
            "category": product.category,
            "unit": product.unit,
            "unit_price": float(product.unit_price),
            "min_stock": product.min_stock,
            "total_stock": total_stock,
            "stock_value": float(product.unit_price * total_stock),
            "status": "out" if total_stock == 0 else "low" if total_stock < product.min_stock else "ok",
            "stock_by_warehouse": stock_by_warehouse
        })
    
    return inventory


@router.get("/movements", response_model=List[StockMovementWithDetails])
async def list_movements(
    current_user: CurrentUser,
    db: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    warehouse_id: Optional[UUID] = None,
    product_id: Optional[UUID] = None,
    movement_type: Optional[MovementType] = None
):
    """
    List stock movements with details
    """
    query = select(StockMovement).join(
        Product, StockMovement.product_id == Product.id
    ).where(
        Product.company_id == current_user.company_id
    )
    
    if warehouse_id:
        query = query.where(StockMovement.warehouse_id == warehouse_id)
    
    if product_id:
        query = query.where(StockMovement.product_id == product_id)
    
    if movement_type:
        query = query.where(StockMovement.type == movement_type)
    
    query = query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    movements = result.scalars().all()
    
    # Get details for each movement
    movements_with_details = []
    for mv in movements:
        # Get product
        prod_result = await db.execute(
            select(Product).where(Product.id == mv.product_id)
        )
        product = prod_result.scalar_one_or_none()
        
        # Get warehouse
        wh_result = await db.execute(
            select(Warehouse).where(Warehouse.id == mv.warehouse_id)
        )
        warehouse = wh_result.scalar_one_or_none()
        
        # Get user
        user_name = None
        if mv.user_id:
            user_result = await db.execute(
                select(User).where(User.id == mv.user_id)
            )
            user = user_result.scalar_one_or_none()
            user_name = user.full_name if user else None
        
        movements_with_details.append(StockMovementWithDetails(
            **StockMovementResponse.model_validate(mv).model_dump(),
            product_name=product.name if product else None,
            product_sku=product.sku if product else None,
            warehouse_name=warehouse.name if warehouse else None,
            user_name=user_name
        ))
    
    return movements_with_details


@router.post("/movements", response_model=StockMovementResponse)
async def create_movement(
    movement_in: StockMovementCreate,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Create a stock movement (entry, exit, or adjustment)
    """
    # Verify product exists and belongs to company
    prod_result = await db.execute(
        select(Product).where(Product.id == movement_in.product_id)
    )
    product = prod_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produit non trouvé"
        )
    
    if not check_company_access(current_user, product.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Verify warehouse
    wh_result = await db.execute(
        select(Warehouse).where(Warehouse.id == movement_in.warehouse_id)
    )
    warehouse = wh_result.scalar_one_or_none()
    
    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrepôt non trouvé"
        )
    
    if not check_warehouse_access(current_user, warehouse.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à cet entrepôt"
        )
    
    # Get or create stock record
    stock_result = await db.execute(
        select(Stock).where(
            Stock.product_id == movement_in.product_id,
            Stock.warehouse_id == movement_in.warehouse_id
        )
    )
    stock = stock_result.scalar_one_or_none()
    
    if not stock:
        stock = Stock(
            product_id=movement_in.product_id,
            warehouse_id=movement_in.warehouse_id,
            quantity=0
        )
        db.add(stock)
        await db.flush()
    
    # Calculate new quantity
    current_qty = stock.quantity
    movement_qty = movement_in.quantity
    
    if movement_in.type == MovementType.IN:
        new_qty = current_qty + movement_qty
    elif movement_in.type == MovementType.OUT:
        new_qty = current_qty - movement_qty
        if new_qty < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuffisant. Disponible: {current_qty}"
            )
    else:  # ADJUST
        new_qty = current_qty + movement_qty  # Can be negative for reduction
        if new_qty < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="L'ajustement résulterait en un stock négatif"
            )
    
    # Update stock
    stock.quantity = new_qty
    
    # Create movement record
    movement = StockMovement(
        product_id=movement_in.product_id,
        warehouse_id=movement_in.warehouse_id,
        user_id=current_user.id,
        type=movement_in.type,
        quantity=movement_qty,
        reason=movement_in.reason,
        reference=movement_in.reference
    )
    db.add(movement)
    
    await db.commit()
    await db.refresh(movement)
    
    return StockMovementResponse.model_validate(movement)


@router.get("/alerts")
async def get_stock_alerts(
    current_user: CurrentUser,
    db: DBSession,
    warehouse_id: Optional[UUID] = None
):
    """
    Get products with low stock or out of stock
    """
    # Get all products for company
    products_query = select(Product).where(
        Product.company_id == current_user.company_id,
        Product.is_active == True
    )
    products_result = await db.execute(products_query)
    products = products_result.scalars().all()
    
    alerts = []
    for product in products:
        # Get stock
        stock_query = select(func.coalesce(func.sum(Stock.quantity), 0))
        stock_query = stock_query.where(Stock.product_id == product.id)
        
        if warehouse_id:
            stock_query = stock_query.where(Stock.warehouse_id == warehouse_id)
        
        stock_result = await db.execute(stock_query)
        total_stock = int(stock_result.scalar() or 0)
        
        if total_stock == 0:
            alerts.append({
                "type": "OUT_OF_STOCK",
                "product_id": str(product.id),
                "product_name": product.name,
                "product_sku": product.sku,
                "current_stock": total_stock,
                "min_stock": product.min_stock,
                "message": f"{product.name} - Rupture de stock"
            })
        elif total_stock < product.min_stock:
            alerts.append({
                "type": "LOW_STOCK",
                "product_id": str(product.id),
                "product_name": product.name,
                "product_sku": product.sku,
                "current_stock": total_stock,
                "min_stock": product.min_stock,
                "message": f"{product.name} - Stock faible ({total_stock}/{product.min_stock})"
            })
    
    # Sort by type (OUT_OF_STOCK first)
    alerts.sort(key=lambda x: (0 if x["type"] == "OUT_OF_STOCK" else 1, x["product_name"]))
    
    return {
        "total": len(alerts),
        "out_of_stock": len([a for a in alerts if a["type"] == "OUT_OF_STOCK"]),
        "low_stock": len([a for a in alerts if a["type"] == "LOW_STOCK"]),
        "alerts": alerts
    }
