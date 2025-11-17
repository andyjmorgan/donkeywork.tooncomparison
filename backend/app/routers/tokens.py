"""
Router for token counting endpoints.
"""

from typing import Literal
from fastapi import APIRouter, HTTPException, Path
from functools import lru_cache

from app.config import settings
from app.models import (
    CountTokensRequest,
    TokenCountResponse,
    CountTokensBatchRequest,
    TokenCountBatchResponse
)
from app.services import AnthropicService, GoogleService

router = APIRouter(prefix="/api/v1", tags=["tokens"])

VendorType = Literal["anthropic", "google"]


@lru_cache()
def get_anthropic_service() -> AnthropicService:
    """Get cached Anthropic service instance."""
    return AnthropicService(api_key=settings.ANTHROPIC_API_KEY)


@lru_cache()
def get_google_service() -> GoogleService:
    """Get cached Google service instance."""
    return GoogleService(api_key=settings.GOOGLE_API_KEY)


@router.post(
    "/{vendor}/counttokens",
    response_model=TokenCountResponse,
    summary="Count tokens in text",
    description="Count the number of tokens in the provided text using the specified vendor and model."
)
async def count_tokens(
    request: CountTokensRequest,
    vendor: VendorType = Path(
        ...,
        description="Vendor name (anthropic or google)"
    )
) -> TokenCountResponse:
    """Count tokens in text using the specified vendor and model.

    Args:
        request: CountTokensRequest containing text and model
        vendor: Vendor name ("anthropic" or "google")

    Returns:
        TokenCountResponse with vendor, model, and token count

    Raises:
        HTTPException: If vendor is invalid or API call fails
    """
    try:
        if vendor == "anthropic":
            service = get_anthropic_service()
            token_count = await service.count_tokens(
                text=request.text,
                model=request.model
            )
        elif vendor == "google":
            service = get_google_service()
            token_count = await service.count_tokens(
                text=request.text,
                model=request.model
            )
        else:
            # This should never happen due to VendorType validation
            raise HTTPException(
                status_code=400,
                detail=f"Invalid vendor: {vendor}. Must be 'anthropic' or 'google'."
            )

        return TokenCountResponse(
            vendor=vendor,
            model=request.model,
            token_count=token_count
        )

    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error counting tokens: {str(e)}"
        )


@router.post(
    "/{vendor}/counttokens/batch",
    response_model=TokenCountBatchResponse,
    summary="Count tokens in multiple texts",
    description="Count the number of tokens in multiple text formats using the specified vendor and model."
)
async def count_tokens_batch(
    request: CountTokensBatchRequest,
    vendor: VendorType = Path(
        ...,
        description="Vendor name (anthropic or google)"
    )
) -> TokenCountBatchResponse:
    """Count tokens in multiple texts using the specified vendor and model.

    Args:
        request: CountTokensBatchRequest containing texts dictionary and model
        vendor: Vendor name ("anthropic" or "google")

    Returns:
        TokenCountBatchResponse with vendor, model, and token counts dictionary

    Raises:
        HTTPException: If vendor is invalid or API call fails
    """
    try:
        if vendor == "anthropic":
            service = get_anthropic_service()
            token_counts = await service.count_tokens_batch(
                texts=request.texts,
                model=request.model
            )
        elif vendor == "google":
            service = get_google_service()
            token_counts = await service.count_tokens_batch(
                texts=request.texts,
                model=request.model
            )
        else:
            # This should never happen due to VendorType validation
            raise HTTPException(
                status_code=400,
                detail=f"Invalid vendor: {vendor}. Must be 'anthropic' or 'google'."
            )

        return TokenCountBatchResponse(
            vendor=vendor,
            model=request.model,
            token_counts=token_counts
        )

    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error counting tokens: {str(e)}"
        )
