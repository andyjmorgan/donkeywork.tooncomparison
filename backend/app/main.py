"""
Main FastAPI application for token counting.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference

from app.config import settings
from app.routers import models_router, tokens_router

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Token counting API for Anthropic and Google Gemini models",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(models_router)
app.include_router(tokens_router)


@app.get("/", tags=["root"])
async def root():
    """Root endpoint providing API information."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "scalar": "/scalar",
        "endpoints": {
            "list_models": "/api/v1/{vendor}/models",
            "count_tokens": "/api/v1/{vendor}/counttokens"
        }
    }


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    """Scalar API documentation."""
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=f"{settings.APP_NAME} - API Documentation",
        scalar_proxy_url="https://proxy.scalar.com",
    )


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }
