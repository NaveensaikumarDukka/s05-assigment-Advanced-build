const { initializeLangSmith, traceFunction } = require('./lib/langsmith-tracing.ts');

async function testLangSmithTracing() {
  try {
    // Initialize LangSmith with a test API key
    const testApiKey = process.env.LANGSMITH_API_KEY || 'test-key';
    
    console.log('Initializing LangSmith...');
    initializeLangSmith({
      apiKey: testApiKey,
      project: 'financial-research-agent',
      endpoint: 'https://api.smith.langchain.com'
    });
    
    console.log('Testing trace function...');
    
    // Test the trace function
    const result = await traceFunction(
      'test-operation',
      'chain',
      { test: 'data' },
      async () => {
        console.log('Executing test operation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true, message: 'Test completed successfully' };
      },
      'financial-research-agent'
    );
    
    console.log('Test result:', result);
    console.log('LangSmith tracing test completed successfully!');
    
  } catch (error) {
    console.error('LangSmith tracing test failed:', error);
  }
}

// Run the test
testLangSmithTracing(); 