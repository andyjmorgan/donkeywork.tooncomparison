# Token Counter API Backend

FastAPI backend for counting tokens using Anthropic and Google Gemini SDKs.

## Features

- List available models from Anthropic and Google Gemini
- Count tokens in text using vendor-specific models
- Health check endpoint for monitoring
- Async API with proper error handling
- CORS support for frontend integration
- Multiple API documentation formats (Swagger, ReDoc, Scalar)
- Docker support for easy deployment

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app & CORS setup
│   ├── config.py               # Settings with pydantic-settings
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests.py         # Request models
│   │   └── responses.py        # Response models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── models.py           # Models listing endpoint
│   │   └── tokens.py           # Token counting endpoint
│   └── services/
│       ├── __init__.py
│       ├── anthropic_service.py
│       └── google_service.py
├── Dockerfile
├── requirements.txt
├── .env.example
├── .dockerignore
└── README.md
```

## Setup

### 1. Prerequisites

- Python 3.12+
- Anthropic API key
- Google API key

### 2. Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env
```

### 3. Configure Environment

Edit `.env` and add your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_key_here
GOOGLE_API_KEY=your_google_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Scalar Docs: http://localhost:8000/scalar
- Health Check: http://localhost:8000/health

## API Documentation

### Base URL

```
http://localhost:8000/api/v1
```

### Endpoints

#### 1. List Models

Get available models from a vendor.

**Request:**
```http
GET /api/v1/{vendor}/models
```

**Path Parameters:**
- `vendor` (string, required): Either "anthropic" or "google"

**Response:**
```json
{
  "vendor": "anthropic",
  "models": [
    {
      "id": "claude-3-5-sonnet-20241022",
      "display_name": "Claude 3.5 Sonnet",
      "created_at": "2024-10-22T00:00:00Z"
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:8000/api/v1/anthropic/models
```

#### 2. Count Tokens

Count tokens in text using a specific model.

**Request:**
```http
POST /api/v1/{vendor}/counttokens
Content-Type: application/json

{
  "text": "Hello, world! How are you today?",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Path Parameters:**
- `vendor` (string, required): Either "anthropic" or "google"

**Request Body:**
- `text` (string, required): Text to count tokens for
- `model` (string, required): Model ID to use for counting

**Response:**
```json
{
  "vendor": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "token_count": 42
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/v1/anthropic/counttokens \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!",
    "model": "claude-3-5-sonnet-20241022"
  }'
```

#### 3. Health Check

Check if the API is running and healthy.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

### Error Responses

The API returns standard HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid vendor or model)
- `500`: Server error (API failures, configuration issues)

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Docker Deployment

### Build Image

```bash
docker build -t token-counter-api .
```

### Run Container

```bash
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e GOOGLE_API_KEY=your_key \
  -e CORS_ORIGINS="*" \
  token-counter-api
```

Or use environment file:

```bash
docker run -p 8000:8000 --env-file .env token-counter-api
```

## Development

### Project Configuration

The application uses `pydantic-settings` for configuration management. All settings are defined in `app/config.py` and loaded from environment variables.

### Service Layer

Services (`app/services/`) handle SDK integration:
- **AnthropicService**: Anthropic API operations
- **GoogleService**: Google Gemini API operations

Both services:
- Handle API authentication
- Provide async methods for listing models and counting tokens
- Raise HTTPException for proper error handling
- Handle empty text (returns 0 tokens)
- Validate model IDs

### Caching

Model listing services are cached using `@lru_cache()` to avoid recreating SDK clients on every request.

### CORS Configuration

CORS is configured via the `CORS_ORIGINS` environment variable:
- Single origin: `CORS_ORIGINS=http://localhost:5173`
- Multiple origins: `CORS_ORIGINS=http://localhost:5173,http://localhost:3000`
- All origins: `CORS_ORIGINS=*`

## Testing

### Manual Testing with cURL

**List Anthropic models:**
```bash
curl http://localhost:8000/api/v1/anthropic/models
```

**List Google models:**
```bash
curl http://localhost:8000/api/v1/google/models
```

**Count tokens (Anthropic):**
```bash
curl -X POST http://localhost:8000/api/v1/anthropic/counttokens \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "model": "claude-3-5-sonnet-20241022"}'
```

**Count tokens (Google):**
```bash
curl -X POST http://localhost:8000/api/v1/google/counttokens \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!", "model": "gemini-1.5-flash"}'
```

### Using Swagger UI

Navigate to http://localhost:8000/docs for interactive API documentation and testing.

## Dependencies

- **fastapi**: Web framework
- **uvicorn**: ASGI server
- **anthropic**: Anthropic SDK for Claude models
- **google-genai**: Google SDK for Gemini models
- **pydantic-settings**: Settings management
- **python-dotenv**: Environment variable loading

## License

This project is part of the Toon Parser UI application.
