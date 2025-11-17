"""
Service for interacting with Google Gemini API.
"""

from typing import List, Dict
from google import genai
from google.genai import types
from fastapi import HTTPException

from app.models import ModelInfo


class GoogleService:
    """Service for Google Gemini API operations."""

    def __init__(self, api_key: str):
        """Initialize Google GenAI client.

        Args:
            api_key: Google API key
        """
        try:
            self.client = genai.Client(api_key=api_key)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Google client: {str(e)}"
            )

    async def list_models(self) -> List[ModelInfo]:
        """List available Google models with generateContent capability.

        Returns:
            List of ModelInfo objects

        Raises:
            HTTPException: If API call fails
        """
        try:
            response = self.client.models.list()

            models = []
            for model in response:
                # Check for supported actions/methods (try different attribute names)
                supported = False
                if hasattr(model, 'supported_generation_methods'):
                    supported = 'generateContent' in model.supported_generation_methods
                elif hasattr(model, 'supported_actions'):
                    supported = 'generateContent' in model.supported_actions
                else:
                    # If no attribute found, include all models
                    supported = True

                if supported:
                    # Extract model name and create display name
                    model_id = model.name if hasattr(model, 'name') else str(model)
                    if model_id.startswith('models/'):
                        model_id = model_id.replace('models/', '')

                    display_name = model.display_name if hasattr(model, 'display_name') else model_id

                    # Use model creation date if available, otherwise use a default
                    created_at = getattr(model, 'create_time', '2024-01-01T00:00:00Z')
                    if hasattr(created_at, 'isoformat'):
                        created_at = created_at.isoformat()
                    elif not isinstance(created_at, str):
                        created_at = '2024-01-01T00:00:00Z'

                    models.append(ModelInfo(
                        id=model_id,
                        display_name=display_name,
                        created_at=created_at
                    ))

            return models

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to list Google models: {str(e)}"
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
            # Ensure model has 'models/' prefix if not present
            if not model.startswith('models/'):
                model = f'models/{model}'

            response = self.client.models.count_tokens(
                model=model,
                contents=text
            )

            return response.total_tokens

        except Exception as e:
            # Handle specific errors
            error_message = str(e).lower()
            if "model" in error_message or "not found" in error_message:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid model: {model}"
                )
            if "api key" in error_message or "authentication" in error_message:
                raise HTTPException(
                    status_code=500,
                    detail="Google API authentication error"
                )
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

        # Ensure model has 'models/' prefix if not present
        if not model.startswith('models/'):
            model = f'models/{model}'

        for format_name, text in texts.items():
            # Handle empty text
            if not text or not text.strip():
                results[format_name] = 0
                continue

            try:
                response = self.client.models.count_tokens(
                    model=model,
                    contents=text
                )
                results[format_name] = response.total_tokens

            except Exception as e:
                # Handle specific errors
                error_message = str(e).lower()
                if "model" in error_message or "not found" in error_message:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid model: {model}"
                    )
                if "api key" in error_message or "authentication" in error_message:
                    raise HTTPException(
                        status_code=500,
                        detail="Google API authentication error"
                    )
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to count tokens for format '{format_name}': {str(e)}"
                )

        return results
