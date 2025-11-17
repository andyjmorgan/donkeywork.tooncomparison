"""
Response models for API endpoints.
"""

from typing import List, Dict
from pydantic import BaseModel, Field


class ModelInfo(BaseModel):
    """Information about a model."""

    id: str = Field(
        ...,
        description="Unique model identifier",
        examples=["claude-3-5-sonnet-20241022"]
    )
    display_name: str = Field(
        ...,
        description="Human-readable model name",
        examples=["Claude 3.5 Sonnet"]
    )
    created_at: str = Field(
        ...,
        description="Model creation date (ISO 8601 format)",
        examples=["2024-10-22T00:00:00Z"]
    )


class ModelsResponse(BaseModel):
    """Response model for models listing endpoint."""

    vendor: str = Field(
        ...,
        description="Vendor name",
        examples=["anthropic"]
    )
    models: List[ModelInfo] = Field(
        ...,
        description="List of available models"
    )


class TokenCountResponse(BaseModel):
    """Response model for token counting endpoint."""

    vendor: str = Field(
        ...,
        description="Vendor name",
        examples=["anthropic"]
    )
    model: str = Field(
        ...,
        description="Model ID used for counting",
        examples=["claude-3-5-sonnet-20241022"]
    )
    token_count: int = Field(
        ...,
        description="Number of tokens in the text",
        examples=[42]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "vendor": "anthropic",
                "model": "claude-3-5-sonnet-20241022",
                "token_count": 42
            }
        }


class TokenCountBatchResponse(BaseModel):
    """Response model for batch token counting endpoint."""

    vendor: str = Field(
        ...,
        description="Vendor name",
        examples=["anthropic"]
    )
    model: str = Field(
        ...,
        description="Model ID used for counting",
        examples=["claude-3-5-sonnet-20241022"]
    )
    token_counts: Dict[str, int] = Field(
        ...,
        description="Dictionary mapping format names to token counts",
        examples=[{
            "json": 42,
            "jsonCompact": 35,
            "yaml": 38,
            "toon": 32
        }]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "vendor": "anthropic",
                "model": "claude-3-5-sonnet-20241022",
                "token_counts": {
                    "json": 42,
                    "jsonCompact": 35,
                    "yaml": 38,
                    "toon": 32
                }
            }
        }
