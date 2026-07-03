"""
ZION STOCK OS - Product Routes
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func
from decimal import Decimal

from app.models.product import Product
from app.models.stock import Stock
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductWithStock
from app.api.deps import CurrentUser, ManagerUser, DBSession, check_company_access

router = APIRouter()


@router.get("/", response_model=List[ProductWithStock])
async def list_products(
    current_user: CurrentUser,
    db: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    warehouse_id: Optional[UUID] = None
):
    """
    List all products with stock information
    """
    query = select(Product).where(Product.company_id == current_user.company_id)
    
    if category:
        query = query.where(Product.category == category)
    
    if is_active is not None:
        query = query.where(Product.is_active == is_active)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Product.name.ilike(search_filter)) | 
            (Product.sku.ilike(search_filter))
        )
    
    query = query.offset(skip).limit(limit).order_by(Product.name)
    
    result = await db.execute(query)
    products = result.scalars().all()
    
    # Get stock for each product
    products_with_stock = []
    for product in products:
        # Get total stock
        stock_query = select(func.coalesce(func.sum(Stock.quantity), 0))
        stock_query = stock_query.where(Stock.product_id == product.id)
        
        if warehouse_id:
            stock_query = stock_query.where(Stock.warehouse_id == warehouse_id)
        
        stock_result = await db.execute(stock_query)
        total_stock = int(stock_result.scalar() or 0)
        
        # Determine status
        if total_stock == 0:
            stock_status = "out"
        elif total_stock < product.min_stock:
            stock_status = "low"
        else:
            stock_status = "ok"
        
        stock_value = Decimal(total_stock) * product.unit_price
        
        products_with_stock.append(ProductWithStock(
            **ProductResponse.model_validate(product).model_dump(),
            total_stock=total_stock,
            stock_value=stock_value,
            stock_status=stock_status
        ))
    
    return products_with_stock


@router.post("/", response_model=ProductResponse)
async def create_product(
    product_in: ProductCreate,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Create a new product (admin/magasinier only)
    """
    if not check_company_access(current_user, product_in.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # Check SKU uniqueness
    result = await db.execute(
        select(Product).where(Product.sku == product_in.sku)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce SKU existe déjà"
        )
    
    product = Product(**product_in.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    
    return ProductResponse.model_validate(product)


@router.get("/categories")
async def list_categories(
    current_user: CurrentUser,
    db: DBSession
):
    """
    List all product categories in company
    """
    result = await db.execute(
        select(Product.category)
        .where(Product.company_id == current_user.company_id)
        .where(Product.category.isnot(None))
        .distinct()
        .order_by(Product.category)
    )
    categories = [row[0] for row in result.fetchall() if row[0]]
    
    return {"categories": categories}


@router.get("/{product_id}", response_model=ProductWithStock)
async def get_product(
    product_id: UUID,
    current_user: CurrentUser,
    db: DBSession,
    warehouse_id: Optional[UUID] = None
):
    """
    Get product by ID with stock info
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
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
    
    # Get stock
    stock_query = select(func.coalesce(func.sum(Stock.quantity), 0))
    stock_query = stock_query.where(Stock.product_id == product_id)
    
    if warehouse_id:
        stock_query = stock_query.where(Stock.warehouse_id == warehouse_id)
    
    stock_result = await db.execute(stock_query)
    total_stock = int(stock_result.scalar() or 0)
    
    if total_stock == 0:
        stock_status = "out"
    elif total_stock < product.min_stock:
        stock_status = "low"
    else:
        stock_status = "ok"
    
    return ProductWithStock(
        **ProductResponse.model_validate(product).model_dump(),
        total_stock=total_stock,
        stock_value=Decimal(total_stock) * product.unit_price,
        stock_status=stock_status
    )


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_in: ProductUpdate,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Update product (admin/magasinier only)
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
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
    
    update_data = product_in.model_dump(exclude_unset=True)
    
    # Check SKU uniqueness if changing
    if "sku" in update_data:
        result = await db.execute(
            select(Product).where(
                Product.sku == update_data["sku"],
                Product.id != product_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce SKU existe déjà"
            )
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    
    return ProductResponse.model_validate(product)


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Delete product (admin/magasinier only)
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    
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
    
    await db.delete(product)
    await db.commit()
    
    return {"message": "Produit supprimé"}
