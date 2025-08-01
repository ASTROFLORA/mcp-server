# 🧬 AstroFlora AI Chat

AstroFlora AI is an advanced biological intelligence assistant built with Next.js and the AI SDK. It specializes in plant biology, genetics, biotechnology, and life sciences, featuring real-time tool integration for enhanced functionality.

## ✨ Features

- **🤖 AI-Powered Chat**: Powered by OpenAI GPT-4o with biological expertise
- **🛠️ Tool Integration**: Real-time tools including Colombia time lookup
- **⚡ Streaming Responses**: Real-time streaming chat interface
- **🎨 Modern UI**: Beautiful Chakra UI components with dark/light mode
- **📱 Responsive Design**: Optimized for desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd astroflora-ai-chat
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠️ Available Tools

- **🕐 Colombia Time**: Get current time in Colombia (COT/UTC-5)
- More tools coming soon...

## 🏗️ Architecture

- **Frontend**: Next.js 15 with App Router
- **UI**: Chakra UI v3 with modern design system
- **AI**: OpenAI GPT-4o via AI SDK v5
- **Streaming**: Real-time response streaming
- **Tools**: Direct AI SDK tool integration (no MCP dependencies)

## 📂 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Main chat API endpoint
│   │   └── colombia-time/ # Colombia time API endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Chat interface
├── components/
│   └── ui/               # Reusable UI components
└── ...
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Tools

1. Create tool definition in `src/app/api/chat/route.ts`
2. Add tool logic using AI SDK `tool()` function
3. Update system prompt if needed

## 🚀 Deployment

Deploy on Vercel (recommended):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Or manually:

1. Build the project: `npm run build`
2. Deploy to your preferred platform
3. Set environment variables on your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using Next.js, AI SDK, and OpenAI GPT-4o
