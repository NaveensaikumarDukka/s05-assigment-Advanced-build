import { NextRequest, NextResponse } from 'next/server';
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

    console.log(`Starting simple research for query: ${query} with model: ${model}`);

    // Use the simple agent without any LangSmith dependencies
    const agent = new FinancialResearchAgentSimple(openaiApiKey, tavilyApiKey, model);

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
      useLangSmith: false, // Always false for simple agent
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Simple research error:', error);
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