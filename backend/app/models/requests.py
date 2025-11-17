"""
Request models for API endpoints.
"""

from typing import Dict
from pydantic import BaseModel, Field


class CountTokensRequest(BaseModel):
    """Request model for token counting endpoint (single text)."""

    text: str = Field(
        ...,
        description="Text content to count tokens for",
        examples=["Hello, world!"]
    )
    model: str = Field(
        ...,
        description="Model ID to use for token counting",
        examples=["claude-3-5-sonnet-20241022"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "Hello, world! How are you today?",
                "model": "claude-3-5-sonnet-20241022"
            }
        }


class CountTokensBatchRequest(BaseModel):
    """Request model for batch token counting endpoint."""

    texts: Dict[str, str] = Field(
        ...,
        description="Dictionary of format names to text content",
        examples=[{
            "json": '{"key": "value"}',
            "jsonCompact": '{"key":"value"}',
            "yaml": "key: value\n",
            "toon": "encoded_toon_content",
            "xml": "<root><key>value</key></root>"
        }]
    )
    model: str = Field(
        ...,
        description="Model ID to use for token counting",
        examples=["claude-3-5-sonnet-20241022"]
    )

    class Config:
        json_schema_extra = {
            "example": {
                "texts": {
                    "json": '{"greeting": "Hello, world!"}',
                    "jsonCompact": '{"greeting":"Hello, world!"}',
                    "yaml": "greeting: Hello, world!\n",
                    "toon": "example_toon_encoded_data"
                },
                "model": "claude-3-5-sonnet-20241022"
            }
        }
