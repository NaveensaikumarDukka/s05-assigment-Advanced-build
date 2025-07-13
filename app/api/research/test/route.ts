import { NextRequest, NextResponse } from 'next/server';
import { FinancialResearchAgentSimple } from '@/lib/financial-agent-simple';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
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

    console.log(`Testing research without LangSmith for query: ${query}`);

    // Create the financial agent with provided API keys and model
    const agent = new FinancialResearchAgentSimple(openaiApiKey, tavilyApiKey, model);

    // Test with minimal options to isolate the issue
    const results = await agent.research(query, {
      includeWebSearch: false,
      includeAcademicResearch: false,
      includeMarketData: false
    });

    return NextResponse.json({
      success: true,
      results,
      query,
      model,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test research error:', error);
    return NextResponse.json(
      { 
        error: 'Test research failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 