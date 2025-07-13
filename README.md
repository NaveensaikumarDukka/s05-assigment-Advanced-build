# Unified Financial Research Agent

A comprehensive Next.js application featuring a unified AI agent that combines Tavily web search, ArXiv academic research, and Yahoo Finance market data into one powerful financial research tool. The application is specifically designed for wealth and asset management with LangSmith tracing for monitoring and debugging.

## Features

### 🤖 **Unified AI Agent**
- **Single Agent**: One agent that orchestrates all research tools
- **Tavily Integration**: Web search for real-time financial information
- **ArXiv Integration**: Academic research papers and publications
- **Yahoo Finance**: Market data and stock information
- **AI Synthesis**: OpenAI-powered analysis and insights

### 📊 **Agent Capabilities**
- **Comprehensive Research**: Combines web search, academic papers, and market data
- **Intelligent Synthesis**: AI-powered analysis of all data sources
- **Flexible Configuration**: Enable/disable individual data sources
- **Target Symbols**: Specify stock symbols for market analysis

### 🔧 **LangSmith Tracing**
- **Performance Monitoring**: Track API calls and response times
- **Debugging Tools**: Identify bottlenecks and errors
- **Trace Visualization**: Monitor agent performance
- **Error Tracking**: Comprehensive error logging

### 🎨 **Modern UI**
- **Responsive Design**: Works on desktop and mobile
- **Tailwind CSS**: Beautiful, modern styling
- **Interactive Components**: Real-time feedback and loading states
- **User-Friendly**: Intuitive interface for financial research

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI Tools**: LangChain, OpenAI, Tavily
- **Tracing**: LangSmith
- **HTTP Client**: Axios

## Prerequisites

Before running this application, you'll need:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **API Keys** for the following services:
  - OpenAI API Key
  - Tavily API Key
   - LangSmith API Key

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd financial-research-agent
```

2. **Install dependencies**
```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   LANGSMITH_API_KEY=your_langsmith_api_key_here
   ```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Key Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your environment variables

### Tavily API Key
1. Visit [Tavily](https://tavily.com/)
2. Sign up for an account
3. Generate an API key
4. Add it to your environment variables

### LangSmith API Key
1. Visit [LangSmith](https://smith.langchain.com/)
2. Create an account
3. Generate an API key
4. Add it to your environment variables

## Usage

### 1. **Settings Configuration**
- Navigate to `/settings`
- Enter your API keys (OpenAI, Tavily)
- Test connections to ensure everything is working

### 2. **Unified Agent Research**
- Go to `/research`
- Enter your financial research query
- Configure which data sources to include (web search, academic research, market data)
- Specify target stock symbols (optional)
- View comprehensive results from the unified agent

### 3. **Test the Agent**
- Visit `/test-agent`
- Try pre-built test queries
- See how the unified agent works

### 4. **Market Analysis**
- Visit `/market-analysis`
- Enter stock symbols (e.g., AAPL, MSFT, GOOGL)
- Analyze real-time market data

### 5. **Academic Research**
- Go to `/academic-research`
- Search for academic papers
- Access PDF downloads and summaries

### 6. **Tracing & Monitoring**
- Navigate to `/tracing`
- Test LangSmith connections
- Monitor recent traces
- Debug performance issues

## API Endpoints

### Research API
- `POST /api/research` - Comprehensive financial research
- `GET /api/research` - API information

### Tool APIs
- `POST /api/tavily` - Web search functionality
- `POST /api/openai` - AI analysis
- `POST /api/arxiv` - Academic paper search
- `POST /api/yahoo-finance` - Market data

### LangSmith APIs
- `POST /api/langsmith/test` - Test connection
- `GET /api/langsmith/runs` - Get recent traces

## Project Structure

```
financial-research-agent/
├── app/
│   ├── api/                    # API routes
│   │   ├── research/          # Main research endpoint
│   │   ├── tavily/           # Tavily search
│   │   ├── openai/           # OpenAI analysis
│   │   ├── arxiv/            # ArXiv search
│   │   ├── yahoo-finance/    # Market data
│   │   └── langsmith/        # Tracing endpoints
│   ├── research/             # Research page
│   ├── market-analysis/      # Market analysis page
│   ├── academic-research/    # Academic research page
│   ├── tracing/              # LangSmith tracing page
│   ├── settings/             # Settings page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/
│   └── langsmith-tracing.ts  # Tracing utilities
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Features in Detail

### Comprehensive Research
The main research functionality combines multiple data sources:
1. **Web Search**: Current financial information via Tavily
2. **AI Analysis**: OpenAI processes and analyzes the data
3. **Academic Research**: Academic papers via ArXiv (optional)
4. **Market Data**: Stock information via Yahoo Finance (optional)

### LangSmith Tracing
- **Performance Monitoring**: Track API response times
- **Error Tracking**: Comprehensive error logging
- **Debug Information**: Detailed trace information
- **Connection Testing**: Verify API connections

### User Interface
- **Responsive Design**: Works on all device sizes
- **Loading States**: Real-time feedback during operations
- **Error Handling**: Clear error messages and recovery
- **Example Queries**: Pre-built examples for quick testing

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure all API keys are correctly set in environment variables
   - Test connections in the Settings page
   - Verify API key permissions and quotas

2. **LangSmith Connection Issues**
   - Check LangSmith API key validity
   - Verify network connectivity
   - Test connection in the Tracing page

3. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `npm install`
   - Check TypeScript errors: `npm run lint`

4. **Runtime Errors**
   - Check browser console for detailed error messages
   - Verify API endpoints are accessible
   - Test individual API calls

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Test individual components
- Verify environment setup

## Roadmap

- [ ] Enhanced market data visualization
- [ ] Portfolio tracking features
- [ ] Advanced filtering options
- [ ] Export functionality
- [ ] Mobile app version
- [ ] Real-time notifications
- [ ] Custom research templates
- [ ] Integration with more data sources

---

**Note**: This application is designed for educational and research purposes. Always verify financial information from multiple sources before making investment decisions. 