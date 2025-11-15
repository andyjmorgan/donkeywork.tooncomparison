# Format Tokenizer

A data-driven token efficiency comparison tool for JSON, TOON, and YAML serialization formats. Built to demonstrate that **compact JSON delivers nearly identical token savings to exotic formats** like TOON, while remaining a format LLMs are already trained to understand.

**🎮 [Try it live at toon.donkeywork.dev](https://toon.donkeywork.dev)**

![Format Tokenizer](src/assets/donkeywork.png)

## 🎯 Purpose

This application debunks social media hype around proprietary serialization formats by providing real-time, visual token count comparisons. Test with your own data and see the truth: compact JSON is efficient, familiar, and sufficient.

## ✨ Features

- **Real-Time Token Counting**: Uses `gpt-tokenizer` (o200k_base encoding) to calculate exact token counts
- **Four Format Comparison**: JSON (pretty & compact), TOON, and YAML
- **Visual Tokenization**: Color-coded token breakdown with interactive tooltips
- **Summary Bar Chart**: Side-by-side comparison showing efficiency percentages
- **Mobile Responsive**: Grid layout on mobile, splitter layout on desktop
- **Example Data**: Quick-load Simple and Advanced JSON examples
- **Dark/Light Theme**: Toggle between Lara light and dark cyan themes
- **Copy to Clipboard**: Easy export of any format

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker compose up -d

# Access at http://localhost:8081
```

Or pull from registry:
```bash
docker pull 192.168.0.140:8443/toon-token:latest
```

## 🏗️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: PrimeReact (Lara theme family)
- **Token Counting**: `gpt-tokenizer` (o200k_base)
- **Format Libraries**:
  - `@toon-format/toon` - TOON encoding
  - `js-yaml` - YAML serialization
- **Deployment**: Docker (multi-stage build with nginx)

## 📊 How It Works

1. **Input**: Enter or load JSON data
2. **Parse**: Application validates and converts to all formats
3. **Tokenize**: Each format is tokenized using GPT's o200k_base encoding
4. **Compare**: View token counts, percentages, and visual breakdowns
5. **Analyze**: See that compact JSON is nearly as efficient as TOON

## 🎨 UI Components

### Four-Panel Layout
- **JSON Input** (top-left): Editable textarea with format button
- **JSON Output** (bottom-left): Toggle between compact/pretty with token visualization
- **TOON Output** (top-right): Encoded TOON format
- **YAML Output** (bottom-right): YAML serialization

### Token Visualization
- Toggle between plain text and tokenized view per format
- Colored backgrounds for each token (12-color palette)
- Hover tooltips show token ID and text
- Different palettes for light/dark mode

### Statistics Footer
- Real-time token counts for each format
- Percentage saved/lost compared to current JSON format
- Link to summary modal with bar chart

## 📱 Mobile Experience

On screens ≤768px:
- Splitter layout hidden
- Vertical grid with scrollable sections
- Compact footer with vertical stats layout
- 400-500px panel heights for better viewing

## 🐳 Docker Configuration

Multi-stage build:
1. **Builder Stage**: Node 20 Alpine - installs deps and builds
2. **Production Stage**: Nginx Alpine - serves static files

```dockerfile
# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 🔧 Configuration

### Default Settings
- **Initial Data**: Advanced glossary example
- **Output Format**: Compact JSON (demonstrates efficiency)
- **Theme**: Light mode (lara-light-cyan)
- **Tokenization View**: Enabled for all formats

### Environment
- Port: 8081 (Docker Compose)
- Build Output: `dist/`
- Assets: `src/assets/`

## 📦 Project Structure

```
src/
├── App.tsx           # Main application component
├── App.css          # App-specific styles, mobile responsive
├── index.css        # Global styles, PrimeReact imports
├── main.tsx         # Entry point
└── assets/
    ├── donkeywork.png  # Logo
    └── favicon.ico     # Favicon

public/              # Static assets
index.html          # HTML entry with dynamic theme link
Dockerfile          # Multi-stage build
docker-compose.yml  # Docker Compose configuration
CLAUDE.md           # Detailed project documentation
```

## 🤝 Contributing

This project demonstrates a specific thesis: compact JSON is efficient. Contributions that enhance the comparison or improve the user experience are welcome.

## 📄 License

MIT

## 👤 Author

**Andrew Morgan**
AI Engineer at [Airia](https://airia.com)
- LinkedIn: [andrewjmorgan](https://www.linkedin.com/in/andrewjmorgan/)
- GitHub: [andyjmorgan](https://github.com/andyjmorgan)

## 🙏 Acknowledgments

Built with:
- [PrimeReact](https://primereact.org/) - UI component library
- [@toon-format/toon](https://www.npmjs.com/package/@toon-format/toon) - TOON encoding
- [gpt-tokenizer](https://www.npmjs.com/package/gpt-tokenizer) - Token counting
- [js-yaml](https://www.npmjs.com/package/js-yaml) - YAML serialization

---

**Real talk**: If social media "experts" are hyping exotic formats while ignoring the simplicity of JSON compact, they're talking out their ass. Test it yourself—the data doesn't lie.
