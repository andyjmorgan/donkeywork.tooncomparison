"""
Router for model listing endpoints.
"""

from typing import Literal
from fastapi import APIRouter, HTTPException, Path
from functools import lru_cache

from app.config import settings
from app.models import ModelsResponse
from app.services import AnthropicService, GoogleService

router = APIRouter(prefix="/api/v1", tags=["models"])

VendorType = Literal["anthropic", "google"]


@lru_cache()
def get_anthropic_service() -> AnthropicService:
    """Get cached Anthropic service instance."""
    return AnthropicService(api_key=settings.ANTHROPIC_API_KEY)


@lru_cache()
def get_google_service() -> GoogleService:
    """Get cached Google service instance."""
    return GoogleService(api_key=settings.GOOGLE_API_KEY)


@router.get(
    "/{vendor}/models",
    response_model=ModelsResponse,
    summary="List available models",
    description="Retrieve a list of available models from the specified vendor."
)
async def list_models(
    vendor: VendorType = Path(
        ...,
        description="Vendor name (anthropic or google)"
    )
) -> ModelsResponse:
    """List available models for the specified vendor.

    Args:
        vendor: Vendor name ("anthropic" or "google")

    Returns:
        ModelsResponse containing vendor name and list of models

    Raises:
        HTTPException: If vendor is invalid or API call fails
    """
    try:
        if vendor == "anthropic":
            service = get_anthropic_service()
            models = await service.list_models()
        elif vendor == "google":
            service = get_google_service()
            models = await service.list_models()
        else:
            # This should never happen due to VendorType validation
            raise HTTPException(
                status_code=400,
                detail=f"Invalid vendor: {vendor}. Must be 'anthropic' or 'google'."
            )

        return ModelsResponse(vendor=vendor, models=models)

    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error listing models: {str(e)}"
        )
