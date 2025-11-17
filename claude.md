# Format Tokenizer - Technical Documentation

## Overview
This is a React + Vite SPA that demonstrates token efficiency across different data serialization formats: JSON (pretty and compact), YAML, TOON, and XML. The application compares token counts across three major AI providers (OpenAI, Anthropic, Google) and is designed to be hosted in Docker.

**Purpose**: To show that compact JSON brings nearly the same token savings as exotic formats like TOON, while being a format LLMs are already trained to understand. This debunks social media hype around proprietary formats.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: **PrimeReact** - The cornerstone of this application. All UI components are from PrimeReact. The app uses the md-dark-indigo/md-light-indigo themes with dynamic theme switching.
- **Token Counting**:
  - Client-side: gpt-tokenizer (o200k_base encoding)
  - Backend API: Anthropic and Google tokenizers
- **Format Libraries**:
  - `@toon-format/toon` - TOON encoding
  - `js-yaml` - YAML serialization
  - `js2xmlparser` - XML serialization
- **Charts**: Chart.js via PrimeReact Chart component
- **Deployment**: Docker (multi-stage build with nginx)

## Project Structure

```
src/
├── App.tsx              # Main application logic and state management
├── App.css             # Responsive styles (1200px, 768px breakpoints)
├── index.css           # Global styles and PrimeReact imports
├── main.tsx            # Entry point
├── api/
│   ├── index.ts        # API exports with explicit type separation
│   ├── client.ts       # Backend API calls (fetchModels, countTokensBatch)
│   └── types.ts        # TypeScript interfaces (ModelInfo, TokenStats)
├── components/
│   ├── Header.tsx      # App header with logo and action buttons
│   ├── JsonInputPanel.tsx  # JSON input editor with example loaders
│   ├── OutputPanel.tsx     # Reusable output display with token viz
│   ├── TokenChart.tsx      # Interactive chart with model selection
│   ├── AboutDialog.tsx     # About modal
│   └── TokenDisplay.tsx    # Token visualization with color coding
└── assets/
    └── donkeywork.png  # Logo

public/              # Static assets
index.html          # HTML entry with dynamic theme link
Dockerfile          # Multi-stage build (Node builder → nginx server)
docker-compose.yml  # Docker Compose configuration
.dockerignore       # Excludes node_modules, dist, etc.
```

## Key Features

### 1. Multi-Provider Token Counting
- **OpenAI**: Client-side tokenization using gpt-tokenizer (o200k_base)
- **Anthropic**: Backend API with model selection dropdown
- **Google**: Backend API with model selection dropdown
- Skeleton loaders during API calls for better UX

### 2. Five-Format Comparison
- **JSON Pretty**: Standard formatted JSON
- **JSON Compact**: Minified JSON (demonstrates efficiency)
- **TOON**: Exotic format being compared
- **YAML**: Common alternative format
- **XML**: Traditional data format

### 3. Interactive Horizontal Bar Chart
- Displays all three providers' token counts for each format
- Formats sorted by average token count (smallest to largest)
- Model selection dropdowns for Anthropic and Google
- Dark mode optimized with proper text contrast
- Skeleton loaders during token counting

### 4. Token Visualization
- Color-coded token breakdown for all formats
- 12-color palette cycling through tokens
- Different palettes for light (100-200 variants) and dark mode (600-700 variants)
- Tooltip on hover shows token ID and text
- Always visible (not toggled)

### 5. Component Architecture
The app has been refactored into modular components:
- **Header**: Theme toggle (moon/sun icon), GitHub link, About button
- **JsonInputPanel**: Input textarea with Simple/Advanced examples and Format button
- **OutputPanel**: Reusable component for all outputs with:
  - Title and optional title color
  - Copy button with configurable severity
  - Optional compact/pretty toggle (JSON only)
  - Token visualization display
- **TokenChart**: Chart container with model dropdowns and loading states
- **AboutDialog**: Modal with project information

### 6. Theme Switching
- Defaults to dark mode (md-dark-indigo)
- Toggle to light mode (md-light-indigo)
- Dynamically swaps PrimeReact theme stylesheet via `#app-theme` link
- Chart text colors adapt to theme

### 7. Responsive Design
Three breakpoints for optimal viewing across devices:

#### Desktop (>1200px)
- Top row: JSON Input | Chart (50/50 split)
- Bottom row: 4 outputs in horizontal flex layout

#### Tablet (768px-1200px)
- Top row: JSON Input | Chart (50/50 split)
- Bottom row: 2x2 CSS grid for outputs

#### Mobile (<768px)
- Full vertical stack layout
- JSON Input: 300px min height
- Chart: 450px min height (prevents squeezing)
- Each output: 200px min height
- Single column for all outputs
- Scrollable content with overflow-y: auto
- Header stacks vertically

## State Management

### Core State
```typescript
- jsonInput: string              // Current JSON value
- toonOutput: string             // Encoded TOON result
- yamlOutput: string             // YAML result
- xmlOutput: string              // XML result
- error: string                  // Validation errors
- tokenStats: TokenStats         // Token counts for all formats/providers
- darkMode: boolean              // Theme state (defaults to true)
- isCompact: boolean             // JSON output format toggle
- aboutVisible: boolean          // About modal state
- isCountingTokens: boolean      // API loading state
```

### API State
```typescript
- anthropicModels: ModelInfo[]
- googleModels: ModelInfo[]
- selectedAnthropicModel: string
- selectedGoogleModel: string
- loadingModels: boolean
```

## Key Functions

### handleJsonChange(value)
- Parses and validates JSON input
- Generates TOON, YAML, XML outputs
- Calculates OpenAI tokens client-side
- Calls backend APIs for Anthropic/Google tokens
- Manages loading states
- Handles errors with Messages component

### toggleTheme()
- Swaps theme stylesheet
- Updates darkMode state
- Affects chart text colors

### copyToClipboard(text)
- Copies format output to clipboard
- Used by all OutputPanel components

## Effects

1. **Initial Load**: Loads models from backend, then processes initial JSON
2. **Model Change**: Re-counts tokens when Anthropic or Google model selection changes
3. **Component Architecture**: All major UI sections extracted to dedicated components

## Styling Approach

### CSS Architecture
1. **PrimeReact Theme** - Loaded dynamically in index.html `<link id="app-theme">`
2. **Global Resets** - index.css (box-sizing only, NO margin/padding resets)
3. **Component Styles** - Inline styles using PrimeReact CSS variables
4. **Responsive Styles** - App.css with media queries

### Responsive Media Queries (App.css)
```css
@media (max-width: 1200px) {
  /* 2x2 grid for outputs */
}

@media (max-width: 768px) {
  /* Full vertical stack, scrollable */
}
```

### PrimeReact Integration
- Uses CSS variables: `var(--surface-card)`, `var(--primary-color)`, etc.
- Button severities: `secondary`, `success` (TOON), `info` (YAML), `warning` (XML), `help` (header)
- No custom theme override - relies on default PrimeReact styling

## Backend API Integration

### Endpoints
- `GET /api/models?provider=anthropic|google` - Fetch available models
- `POST /api/count-tokens-batch` - Count tokens for multiple formats at once

### API Module Structure
```typescript
// src/api/types.ts
export interface ModelInfo {
  id: string
  display_name: string
}

export interface TokenStats {
  openai: { json, jsonCompact, toon, yaml, xml }
  anthropic: { json, jsonCompact, toon, yaml, xml }
  google: { json, jsonCompact, toon, yaml, xml }
}

// src/api/client.ts
export async function fetchModels(provider: string): Promise<ModelInfo[]>
export async function countTokensBatch(texts: object, provider: string, model: string): Promise<object>

// src/api/index.ts
export type { ModelInfo, TokenStats } from './types'
export { fetchModels, countTokensBatch } from './client'
```

Note: Uses explicit `export type` syntax for TypeScript's `verbatimModuleSyntax` compatibility.

## About Modal Content

The modal presents a direct message:
- Compares token efficiency across formats
- States that **Compact JSON** achieves similar savings to TOON
- Calls out TOON as a "fad"
- Encourages users to test with real data
- Credits: Andrew Morgan, AI Engineer at Airia
- Lists dependencies: PrimeReact, @toon-format/toon, gpt-tokenizer, js-yaml, js2xmlparser
- Links to author's LinkedIn and company website

## Docker Deployment

### Environment Variables
The backend API requires the following environment variables:
- `ANTHROPIC_API_KEY`: Your Anthropic API key (get it at https://console.anthropic.com/)
- `GOOGLE_API_KEY`: Your Google API key for Gemini (get it at https://aistudio.google.com/app/apikey)
- `CORS_ORIGINS`: Comma-separated list of allowed origins (default: `http://localhost:5173,http://localhost:8081`)

### Setup
1. **Create environment file**:
```bash
cp .env.example .env
# Edit .env and add your actual API keys
```

2. **Docker Compose** (recommended):
```bash
docker compose up -d
# Frontend: http://localhost:8081
# Backend API: http://localhost:8000
```

3. **Manual Docker Build**:
```bash
docker build -t format-tokenizer .
docker run -p 8080:80 format-tokenizer
```

### Dockerfile Strategy
1. **Builder stage**: Node 20 Alpine
   - Install deps with `npm ci`
   - Build production bundle with `npm run build`
2. **Production stage**: nginx Alpine
   - Copy dist to `/usr/share/nginx/html`
   - Expose port 80
   - Serve static files

## Development

### Running Locally
```bash
npm install
npm run dev  # Runs on http://localhost:5173
```

### Build for Production
```bash
npm run build  # Outputs to dist/
```

## Key Dependencies
```json
{
  "@toon-format/toon": "^1.0.0",
  "chart.js": "^4.x",
  "gpt-tokenizer": "^3.4.0",
  "js-yaml": "^4.1.0",
  "js2xmlparser": "^6.0.0",
  "primereact": "^10.9.7",
  "primeicons": "^7.0.0",
  "react": "^19.2.0",
  "react-chartjs-2": "^5.x",
  "react-dom": "^19.2.0"
}
```

## Design Philosophy
- **Simplicity over novelty**: Compact JSON is sufficient
- **Data-driven**: Let users see actual token counts across multiple providers
- **No BS**: Direct messaging about format hype
- **Accessibility**: Tooltips, ARIA labels, keyboard navigation
- **Performance**: Client-side tokenization where possible, efficient backend APIs
- **Modularity**: Component-based architecture for maintainability

## Recent Improvements
1. **Component Extraction**: Refactored App.tsx into Header, JsonInputPanel, OutputPanel, AboutDialog, and TokenChart components
2. **Multi-Provider Support**: Added backend API integration for Anthropic and Google token counting
3. **XML Support**: Added fifth format for comparison
4. **Enhanced Chart**: Horizontal bar chart with model selection and efficiency sorting
5. **Dark Mode Optimization**: Improved chart text contrast and default to dark theme
6. **Responsive Refinement**: Three-tier breakpoint system (desktop/tablet/mobile)
7. **Loading States**: Skeleton loaders for better perceived performance
