"""
ZION STOCK OS - API Routes
"""
from fastapi import APIRouter
from app.api.routes import auth, users, companies, warehouses, products, stock, partners

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(companies.router, prefix="/companies", tags=["Companies"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["Warehouses"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(stock.router, prefix="/stock", tags=["Stock"])
api_router.include_router(partners.router, prefix="/partners", tags=["Partners"])
