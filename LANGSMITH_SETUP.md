# LangSmith Tracing Configuration

## Configuration Setup

### Option 1: UI Configuration (Recommended)

1. Go to the **Settings** page in the application
2. Enter your **LangSmith API Key** in the LangSmith field
3. Click **"Test LangSmith API Key"** to verify the configuration
4. Save your settings

### Option 2: Environment Variables (Alternative)

Create a `.env.local` file in your project root with the following configuration:

```bash
# LangSmith Configuration
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=""
LANGSMITH_PROJECT="financial-research-agent"

# OpenAI Configuration
OPENAI_API_KEY="<your-openai-api-key>"

# Tavily Configuration (optional)
TAVILY_API_KEY="<your-tavily-api-key>"
```

## Configuration Details

### LangSmith Settings
- **Project Name**: `financial-research-agent`
- **Endpoint**: `https://api.smith.langchain.com`
- **Tracing**: Enabled by default

### How to Get Your API Keys

1. **LangSmith API Key**:
   - Go to [LangSmith](https://smith.langchain.com/)
   - Sign up or log in
   - Navigate to Settings → API Keys
   - Create a new API key

2. **OpenAI API Key**:
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key

3. **Tavily API Key** (optional):
   - Go to [Tavily](https://tavily.com/)
   - Sign up and get your API key

## Testing the Configuration

### 1. Test LangSmith API Key (UI Method)
1. Go to the **Settings** page
2. Enter your LangSmith API key
3. Click **"Test LangSmith API Key"** to verify your configuration
4. You should see a success message if the API key is valid

### 2. Test LangSmith API Key (Environment Method)
If using environment variables, the system will automatically detect and use them.

### 2. Test Research with Tracing
Run a research query and check the Tracing page to see the traces.

### 3. View Traces in LangSmith
- Go to [LangSmith Dashboard](https://smith.langchain.com/)
- Navigate to the "financial-research-agent" project
- View your traces and runs

## Features

✅ **Automatic Tracing**: All research operations are traced  
✅ **Project Organization**: Traces are organized under "financial-research-agent"  
✅ **Error Handling**: Graceful fallback if tracing fails  
✅ **Real-time Monitoring**: View traces in the LangSmith dashboard  
✅ **Performance Metrics**: Track execution time and success rates  

## Troubleshooting

### If tracing doesn't work:
1. Verify your LangSmith API key is correct
2. Check that the project name matches: `financial-research-agent`
3. Ensure environment variables are loaded
4. Check the browser console for errors

### If you get 500 errors:
1. The system will automatically fall back to non-tracing mode
2. Check the server logs for specific error messages
3. Verify all API keys are properly configured 