# Toon Playground

## Overview
This is a React + Vite SPA that demonstrates token efficiency across different data serialization formats: JSON (pretty and compact), YAML, and TOON. The application is designed to be hosted in Docker.

**Purpose**: To show that compact JSON brings nearly the same token savings as exotic formats like TOON, while being a format LLMs are already trained to understand. This debunks social media hype around proprietary formats.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: **PrimeReact** - The cornerstone of this application. All UI components (Buttons, InputTextarea, Dialog, InputSwitch, Splitter) are from PrimeReact. The app uses the lara-light-cyan/lara-dark-cyan themes with dynamic theme switching.
- **Token Counting**: gpt-tokenizer (o200k_base encoding)
- **Format Libraries**:
  - `@toon-format/toon` - TOON encoding
  - `js-yaml` - YAML serialization
- **Deployment**: Docker (multi-stage build with nginx)

## Project Structure

```
src/
├── App.tsx           # Main application component
├── App.css          # App-specific styles (format button, mobile responsive)
├── index.css        # Global styles and PrimeReact imports
├── main.tsx         # Entry point
└── assets/
    └── donkeywork.png  # Logo

public/              # Static assets
index.html          # HTML entry with dynamic theme link
Dockerfile          # Multi-stage build (Node builder → nginx server)
.dockerignore       # Excludes node_modules, dist, screenshots, etc.
```

## Key Features

### 1. Four-Panel Layout
- **JSON Input** (top-left): Editable textarea with format button
- **JSON Output** (bottom-left): Shows compact or pretty format with toggle
- **TOON Output** (top-right): Encoded TOON format
- **YAML Output** (bottom-right): YAML serialization

### 2. Token Visualization
- Toggle between plain text and tokenized view per format
- Tokenized view shows colored backgrounds for each token
- Colors cycle through a 12-color palette
- Different palettes for light (100-200 variants) and dark mode (600-700 variants)
- Tooltip on hover shows token ID and text

### 3. Token Statistics Footer
- Displays token count for each format
- Shows percentage saved/more expensive compared to JSON input
- Handles negative percentages (when format is MORE expensive)

### 4. Theme Switching
- Light/Dark theme toggle in header
- Dynamically swaps PrimeReact theme stylesheet via `#app-theme` link
- Theme colors: lara-light-cyan / lara-dark-cyan

### 5. Header Actions
- Theme toggle (moon/sun icon)
- GitHub link (placeholder URL - needs updating)
- About modal

## Component Architecture

### State Management
```typescript
- jsonInput: string              // User's input JSON
- toonOutput: string             // Encoded TOON result
- yamlOutput: string             // YAML result
- error: string                  // Validation errors
- tokenStats: {                  // Token counts
    json: number
    toon: number
    yaml: number
  }
- showTokens: {                  // Toggle tokenized view
    json: boolean
    toon: boolean
    yaml: boolean
  }
- darkMode: boolean              // Theme state
- isCompact: boolean             // JSON output format toggle
- aboutVisible: boolean          // About modal state
```

### Key Functions
- `handleJsonChange(value)` - Parses JSON, generates TOON/YAML, calculates tokens
- `toggleTheme()` - Swaps theme stylesheet
- `renderColoredText(text)` - Renders tokenized view with colors
- `copyToClipboard(text)` - Copies format output

### Effects
- Initial data load on mount
- Re-calculate JSON token count when compact/pretty toggle changes

## Styling Approach

### CSS Architecture
1. **PrimeReact Theme** - Loaded dynamically in index.html `<link id="app-theme">`
2. **Global Resets** - index.css (box-sizing only, NO margin/padding resets)
3. **Component Styles** - Inline styles using PrimeReact CSS variables
4. **Custom Classes** - App.css for format buttons and mobile responsive

### Mobile Responsiveness
- Header stacks vertically on <768px
- Token stats font size reduces
- Section headers adjust
- Defined in App.css `@media` queries

### PrimeReact Integration
- Uses CSS variables: `var(--surface-card)`, `var(--primary-color)`, etc.
- Button severities: `secondary`, `success`, `info`, `help` (purple)
- No custom theme override - relies on default PrimeReact styling

## About Modal Content

The modal presents a direct message:
- Compares token efficiency across formats
- States that **Compact JSON** achieves similar savings to TOON
- Calls out TOON as a "fad"
- Encourages users to test with real data
- Credits: Andrew Morgan, AI Engineer at Airia
- Lists dependencies: PrimeReact, @toon-format/toon, gpt-tokenizer, js-yaml

## Docker Deployment

### Build & Run
```bash
docker build -t toon-playground .
docker run -p 8080:80 toon-playground
```

### Dockerfile Strategy
1. **Builder stage**: Node 20 Alpine
   - Install deps with `npm ci`
   - Build production bundle
2. **Production stage**: nginx Alpine
   - Copy dist to `/usr/share/nginx/html`
   - Expose port 80

## Development

### Running Locally
```bash
npm install
npm run dev  # Runs on http://localhost:5173
```

### Code Quality Notes
- **TODO**: Fix constants being recreated on every render (move outside component)
- **TODO**: Extract duplicate style objects
- **TODO**: Add proper TypeScript interfaces
- **TODO**: Consistent spacing (marginBottom values vary)
- **TODO**: Remove unused `label` param from `copyToClipboard`

### GitHub URL Placeholder
Line 173 in App.tsx uses placeholder `https://github.com` - update with actual repo URL

## Key Dependencies
```json
{
  "@toon-format/toon": "^1.0.0",
  "gpt-tokenizer": "^3.4.0",
  "js-yaml": "^4.1.0",
  "primereact": "^10.9.7",
  "primeicons": "^7.0.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

## Design Philosophy
- **Simplicity over novelty**: Compact JSON is sufficient
- **Data-driven**: Let users see actual token counts
- **No BS**: Direct messaging about format hype
- **Accessibility**: Tooltips, ARIA labels, keyboard navigation
- **Performance**: Client-side only, no backend needed
