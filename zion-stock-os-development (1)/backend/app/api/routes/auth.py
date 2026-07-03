"""
ZION STOCK OS - Authentication Routes
"""
from datetime import datetime, timezone, timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    verify_token,
    validate_password_strength
)
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.company import Company
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    Token,
    TokenRefresh,
    RegisterRequest,
    PasswordChange
)
from app.schemas.user import UserResponse
from app.api.deps import CurrentUser, DBSession

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: DBSession
):
    """
    Authenticate user and return JWT tokens
    """
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == request.email.lower())
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Check if active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )
    
    # Update last login
    user.last_login = datetime.now(timezone.utc)
    await db.commit()
    
    # Generate tokens
    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={
            "role": user.role.value,
            "company_id": str(user.company_id) if user.company_id else None
        }
    )
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/register", response_model=LoginResponse)
async def register(
    request: RegisterRequest,
    db: DBSession
):
    """
    Register a new user with optional company creation
    """
    # Validate password strength
    is_valid, message = validate_password_strength(request.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Check if email exists
    result = await db.execute(
        select(User).where(User.email == request.email.lower())
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Create company if name provided
    company_id = None
    if request.company_name:
        company = Company(name=request.company_name)
        db.add(company)
        await db.flush()
        company_id = company.id
    
    # Create user
    user = User(
        email=request.email.lower(),
        full_name=request.full_name,
        hashed_password=get_password_hash(request.password),
        role=UserRole.ADMIN if company_id else UserRole.VENDEUR,
        company_id=company_id,
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate tokens
    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={
            "role": user.role.value,
            "company_id": str(user.company_id) if user.company_id else None
        }
    )
    refresh_token = create_refresh_token(subject=str(user.id))
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user)
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: TokenRefresh,
    db: DBSession
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = verify_token(request.refresh_token, "refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide ou expiré"
        )
    
    user_id = payload.get("sub")
    
    # Get user
    from uuid import UUID
    result = await db.execute(
        select(User).where(User.id == UUID(user_id))
    )
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé ou désactivé"
        )
    
    # Generate new tokens
    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={
            "role": user.role.value,
            "company_id": str(user.company_id) if user.company_id else None
        }
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))
    
    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: CurrentUser
):
    """
    Get current authenticated user information
    """
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    request: PasswordChange,
    current_user: CurrentUser,
    db: DBSession
):
    """
    Change current user's password
    """
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )
    
    # Validate new password
    is_valid, message = validate_password_strength(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(request.new_password)
    await db.commit()
    
    return {"message": "Mot de passe modifié avec succès"}


@router.post("/logout")
async def logout(current_user: CurrentUser):
    """
    Logout user (client should discard tokens)
    """
    # In a production system, you would blacklist the token here
    return {"message": "Déconnexion réussie"}
