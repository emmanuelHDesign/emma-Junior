"""
ZION STOCK OS - Supplier & Customer Routes
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select

from app.models.partner import Supplier, Customer
from app.schemas.partner import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    CustomerCreate, CustomerUpdate, CustomerResponse
)
from app.api.deps import CurrentUser, ManagerUser, DBSession, check_company_access

router = APIRouter()


# ==================== SUPPLIERS ====================

@router.get("/suppliers", response_model=List[SupplierResponse])
async def list_suppliers(
    current_user: CurrentUser,
    db: DBSession,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
):
    """
    List all suppliers in company
    """
    query = select(Supplier).where(Supplier.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.where(Supplier.is_active == is_active)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Supplier.name.ilike(search_filter)) |
            (Supplier.contact_name.ilike(search_filter))
        )
    
    query = query.order_by(Supplier.name)
    
    result = await db.execute(query)
    suppliers = result.scalars().all()
    
    return [SupplierResponse.model_validate(s) for s in suppliers]


@router.post("/suppliers", response_model=SupplierResponse)
async def create_supplier(
    supplier_in: SupplierCreate,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Create a new supplier
    """
    if not check_company_access(current_user, supplier_in.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    supplier = Supplier(**supplier_in.model_dump())
    db.add(supplier)
    await db.commit()
    await db.refresh(supplier)
    
    return SupplierResponse.model_validate(supplier)


@router.get("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(
    supplier_id: UUID,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Get supplier by ID
    """
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fournisseur non trouvé"
        )
    
    if not check_company_access(current_user, supplier.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    return SupplierResponse.model_validate(supplier)


@router.patch("/suppliers/{supplier_id}", response_model=SupplierResponse)
async def update_supplier(
    supplier_id: UUID,
    supplier_in: SupplierUpdate,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Update supplier
    """
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fournisseur non trouvé"
        )
    
    if not check_company_access(current_user, supplier.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    update_data = supplier_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)
    
    await db.commit()
    await db.refresh(supplier)
    
    return SupplierResponse.model_validate(supplier)


@router.delete("/suppliers/{supplier_id}")
async def delete_supplier(
    supplier_id: UUID,
    current_user: ManagerUser,
    db: DBSession
):
    """
    Delete supplier
    """
    result = await db.execute(
        select(Supplier).where(Supplier.id == supplier_id)
    )
    supplier = result.scalar_one_or_none()
    
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fournisseur non trouvé"
        )
    
    if not check_company_access(current_user, supplier.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    await db.delete(supplier)
    await db.commit()
    
    return {"message": "Fournisseur supprimé"}


# ==================== CUSTOMERS ====================

@router.get("/customers", response_model=List[CustomerResponse])
async def list_customers(
    current_user: CurrentUser,
    db: DBSession,
    is_active: Optional[bool] = None,
    search: Optional[str] = None
):
    """
    List all customers in company
    """
    query = select(Customer).where(Customer.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.where(Customer.is_active == is_active)
    
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Customer.name.ilike(search_filter)) |
            (Customer.contact_name.ilike(search_filter))
        )
    
    query = query.order_by(Customer.name)
    
    result = await db.execute(query)
    customers = result.scalars().all()
    
    return [CustomerResponse.model_validate(c) for c in customers]


@router.post("/customers", response_model=CustomerResponse)
async def create_customer(
    customer_in: CustomerCreate,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Create a new customer
    """
    if not check_company_access(current_user, customer_in.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    await db.commit()
    await db.refresh(customer)
    
    return CustomerResponse.model_validate(customer)


@router.get("/customers/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Get customer by ID
    """
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    if not check_company_access(current_user, customer.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    return CustomerResponse.model_validate(customer)


@router.patch("/customers/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    customer_in: CustomerUpdate,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Update customer
    """
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    if not check_company_access(current_user, customer.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    update_data = customer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(customer, field, value)
    
    await db.commit()
    await db.refresh(customer)
    
    return CustomerResponse.model_validate(customer)


@router.delete("/customers/{customer_id}")
async def delete_customer(
    customer_id: UUID,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Delete customer
    """
    result = await db.execute(
        select(Customer).where(Customer.id == customer_id)
    )
    customer = result.scalar_one_or_none()
    
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client non trouvé"
        )
    
    if not check_company_access(current_user, customer.company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    await db.delete(customer)
    await db.commit()
    
    return {"message": "Client supprimé"}
