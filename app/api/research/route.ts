import { NextRequest, NextResponse } from 'next/server';
import { FinancialResearchAgent } from '@/lib/financial-agent';
import { FinancialResearchAgentSimple } from '@/lib/financial-agent-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      includeWebSearch = true, 
      includeAcademicResearch = true, 
      includeMarketData = true,
      targetSymbols = [],
      openaiApiKey,
      tavilyApiKey,
      model = 'gpt-3.5-turbo'
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`Starting unified agent research for query: ${query} with model: ${model}`);

    // Try with LangSmith tracing first, fallback to simple agent if it fails
    let agent;
    let useLangSmith = false;
    
    try {
      // Check if LangSmith API key is provided from UI
      const langsmithApiKey = body.langsmithApiKey;
      if (langsmithApiKey) {
        try {
          // Initialize LangSmith with the API key from UI
          const { initializeLangSmith } = await import('@/lib/langsmith-tracing');
          initializeLangSmith({
            apiKey: langsmithApiKey,
            project: "financial-research-agent",
            endpoint: "https://api.smith.langchain.com"
          });
          
          agent = new FinancialResearchAgent(openaiApiKey, tavilyApiKey, model);
          useLangSmith = true;
          console.log('Using LangSmith tracing enabled agent with UI-provided API key');
        } catch (langsmithError) {
          console.warn('Failed to initialize LangSmith, falling back to simple agent:', langsmithError);
          agent = new FinancialResearchAgentSimple(openaiApiKey, tavilyApiKey, model);
          useLangSmith = false;
        }
      } else {
        agent = new FinancialResearchAgentSimple(openaiApiKey, tavilyApiKey, model);
        console.log('Using simple agent without LangSmith tracing');
      }
    } catch (error) {
      console.warn('Failed to initialize agent, falling back to simple agent:', error);
      agent = new FinancialResearchAgentSimple(openaiApiKey, tavilyApiKey, model);
      useLangSmith = false;
    }

    const results = await agent.research(query, {
      includeWebSearch,
      includeAcademicResearch,
      includeMarketData,
      targetSymbols
    });

    return NextResponse.json({
      success: true,
      results,
      query,
      model,
      useLangSmith,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unified agent research error:', error);
    return NextResponse.json(
      { 
        error: 'Research failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Unified Financial Research Agent API',
    description: 'Comprehensive financial research using Tavily, ArXiv, and Yahoo Finance',
    endpoints: {
      POST: '/api/research - Conduct comprehensive financial research',
      GET: '/api/research - Get API information'
    },
    tools: [
      'Tavily Search - Web search for current financial information',
      'ArXiv Search - Academic research papers',
      'Yahoo Finance - Market data and stock information',
      'OpenAI Analysis - AI-powered insights and synthesis'
    ],
    parameters: {
      query: 'string (required) - Research query',
      model: 'string (optional) - OpenAI model to use (default: gpt-3.5-turbo)',
      openaiApiKey: 'string (optional) - OpenAI API key',
      tavilyApiKey: 'string (optional) - Tavily API key'
    }
  });
} 