import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Import LangSmith functions
    const { initializeLangSmith, testLangSmithAPI, traceFunction } = await import('../../../../lib/langsmith-tracing');
    
    // Test the API key first
    const apiTestResult = await testLangSmithAPI(apiKey);
    if (!apiTestResult.success) {
      return NextResponse.json(
        { error: apiTestResult.error || 'API key test failed' },
        { status: 400 }
      );
    }
    
    // Initialize LangSmith
    initializeLangSmith({
      apiKey: apiKey,
      project: "financial-research-agent",
      endpoint: "https://api.smith.langchain.com"
    });

    // Test tracing functionality
    const traceResult = await traceFunction(
      "LangSmith Test",
      "chain",
      { test: true, timestamp: new Date().toISOString() },
      async () => {
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 100));
        return { message: "Tracing test completed successfully" };
      },
      "financial-research-agent"
    );

    return NextResponse.json({
      success: true,
      message: "LangSmith integration test completed successfully",
      traceResult
    });

  } catch (error) {
    console.error('LangSmith test error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 