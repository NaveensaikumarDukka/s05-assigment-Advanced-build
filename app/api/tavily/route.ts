import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, tavilyApiKey } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`Starting Tavily search for query: ${query}`);

    const response = await axios.post('https://api.tavily.com/search', {
      api_key: tavilyApiKey || process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 10
    });

    return NextResponse.json({
      success: true,
      results: response.data.results,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Tavily API error:', error);
    return NextResponse.json(
      { 
        error: 'Tavily search failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Tavily Search API',
    description: 'Search for financial information using Tavily',
    usage: {
      method: 'POST',
      body: {
        query: 'string (required)',
        tavilyApiKey: 'string (optional) - for testing'
      }
    }
  });
} 