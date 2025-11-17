"""
Service for interacting with Anthropic API.
"""

from typing import List, Dict
from anthropic import Anthropic, APIError
from fastapi import HTTPException

from app.models import ModelInfo


class AnthropicService:
    """Service for Anthropic API operations."""

    def __init__(self, api_key: str):
        """Initialize Anthropic client.

        Args:
            api_key: Anthropic API key
        """
        try:
            self.client = Anthropic(api_key=api_key)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Anthropic client: {str(e)}"
            )

    async def list_models(self) -> List[ModelInfo]:
        """List available Anthropic models.

        Returns:
            List of ModelInfo objects

        Raises:
            HTTPException: If API call fails
        """
        try:
            response = self.client.models.list()

            models = []
            for model in response.data:
                models.append(ModelInfo(
                    id=model.id,
                    display_name=model.display_name or model.id,
                    created_at=model.created_at.isoformat() if hasattr(model.created_at, 'isoformat') else str(model.created_at)
                ))

            return models

        except APIError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Anthropic API error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list Anthropic models: {str(e)}"
            )

    async def count_tokens(self, text: str, model: str) -> int:
        """Count tokens in text using specified model.

        Args:
            text: Text content to count tokens for
            model: Model ID to use for counting

        Returns:
            Number of tokens

        Raises:
            HTTPException: If API call fails
        """
        # Handle empty text
        if not text or not text.strip():
            return 0

        try:
            response = self.client.messages.count_tokens(
                model=model,
                messages=[{
                    "role": "user",
                    "content": text
                }]
            )

            return response.input_tokens

        except APIError as e:
            # Handle specific API errors
            if "model" in str(e).lower():
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid model: {model}"
                )
            raise HTTPException(
                status_code=500,
                detail=f"Anthropic API error: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to count tokens: {str(e)}"
            )

    async def count_tokens_batch(self, texts: Dict[str, str], model: str) -> Dict[str, int]:
        """Count tokens for multiple texts using specified model.

        Args:
            texts: Dictionary mapping format names to text content
            model: Model ID to use for counting

        Returns:
            Dictionary mapping format names to token counts

        Raises:
            HTTPException: If API call fails
        """
        results = {}

        for format_name, text in texts.items():
            # Handle empty text
            if not text or not text.strip():
                results[format_name] = 0
                continue

            try:
                response = self.client.messages.count_tokens(
                    model=model,
                    messages=[{
                        "role": "user",
                        "content": text
                    }]
                )
                results[format_name] = response.input_tokens

            except APIError as e:
                # Handle specific API errors
                if "model" in str(e).lower():
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid model: {model}"
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"Anthropic API error for format '{format_name}': {str(e)}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to count tokens for format '{format_name}': {str(e)}"
                )

        return results
