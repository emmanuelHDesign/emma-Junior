"""
ZION STOCK OS - User Management Routes
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, func

from app.core.security import get_password_hash, validate_password_strength
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.api.deps import CurrentUser, AdminUser, DBSession, check_company_access

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    current_user: AdminUser,
    db: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    is_active: Optional[bool] = None,
    role: Optional[UserRole] = None
):
    """
    List all users in company (admin only)
    """
    query = select(User)
    
    # Filter by company unless superuser
    if not current_user.is_superuser:
        query = query.where(User.company_id == current_user.company_id)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    if role:
        query = query.where(User.role == role)
    
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [UserResponse.model_validate(u) for u in users]


@router.post("/", response_model=UserResponse)
async def create_user(
    user_in: UserCreate,
    current_user: AdminUser,
    db: DBSession
):
    """
    Create a new user (admin only)
    """
    # Validate password
    is_valid, message = validate_password_strength(user_in.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Check email uniqueness
    result = await db.execute(
        select(User).where(User.email == user_in.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Set company_id
    company_id = user_in.company_id or current_user.company_id
    
    # Check company access
    if company_id and not check_company_access(current_user, company_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à cette entreprise"
        )
    
    # Create user
    user = User(
        email=user_in.email.lower(),
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        company_id=company_id,
        warehouse_id=user_in.warehouse_id,
        is_active=user_in.is_active
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Get user by ID
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Check access
    if not current_user.is_superuser:
        if user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé"
            )
    
    return UserResponse.model_validate(user)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    current_user: AdminUser,
    db: DBSession
):
    """
    Update user (admin only)
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Check company access
    if not current_user.is_superuser:
        if user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé"
            )
    
    # Update fields
    update_data = user_in.model_dump(exclude_unset=True)
    
    if "email" in update_data:
        update_data["email"] = update_data["email"].lower()
        # Check uniqueness
        result = await db.execute(
            select(User).where(
                User.email == update_data["email"],
                User.id != user_id
            )
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: UUID,
    current_user: AdminUser,
    db: DBSession
):
    """
    Delete user (admin only)
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Cannot delete self
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez pas supprimer votre propre compte"
        )
    
    # Check company access
    if not current_user.is_superuser:
        if user.company_id != current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé"
            )
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "Utilisateur supprimé"}
