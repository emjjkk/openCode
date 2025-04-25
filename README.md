![image](https://github.com/user-attachments/assets/92dd931a-3974-4b98-b075-e517e81ffc4e)

## OpenCode is an open-source and experimental real-time web development environment with AI integration that lets you write, preview, and deploy HTML/CSS/JS code instantly. It features:

- ✏️ **Live editing** with instant preview
- 🤖 **AI code generation** using OpenRouter
- 🚀 **One-click deployment** to GitHub & Netlify
- 💾 **Local project saving** and downloading

## Features

- **Real-time Preview**: See changes as you type
- **AI Assistant**: Generate code with natural language prompts
- **Responsive Layout**: Adjustable code/preview panels
- **Export Options**: Download HTML or deploy directly to platforms
- **Customizable**: Configure API endpoints and models

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm/yarn
- OpenRouter API key (free tier available)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/opencode.git
   ```
2. Install dependencies:
   ```bash
   cd opencode
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FALLBACK_API_KEY=your_openrouter_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage Guide

### Basic Editing
1. Write HTML/CSS/JS code in the left panel
2. See instant preview in the right panel
3. Use the divider to adjust panel sizes

### AI Code Generation
1. Type your request in the prompt bar (bottom left)
   - Example: "Create a responsive navbar with dropdown"
2. Click "Generate" or press Enter
3. View and edit the generated code

### Deployment Options
1. **Download HTML**:
   - Click the download button to save as `index.html`

2. **Save to GitHub**:
   - Configure GitHub token and repo in Settings
   - Click "Save to GitHub"

3. **Deploy to Netlify**:
   - Configure Netlify token and site ID in Settings
   - Click "Deploy to Netlify"

### Settings Configuration
Access settings via the gear icon to configure:
- OpenRouter API key
- Custom AI models/endpoints
- GitHub credentials
- Netlify credentials

## Configuration

### Environment Variables
Create `.env.local` with these options:
```env
NEXT_PUBLIC_FALLBACK_API_KEY=your_openrouter_key
```

### Customizing Defaults
Edit `DEFAULT_CONFIG` in `app/page.tsx` to change:
- Default API endpoints
- Starter HTML template
- UI preferences

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI**: Tailwind CSS
- **AI Integration**: OpenRouter API
- **Bundling**: Webpack
- **Deployment**: Vercel (recommended)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

