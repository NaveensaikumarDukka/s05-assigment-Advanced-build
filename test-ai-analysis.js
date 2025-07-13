const { FinancialResearchAgent } = require('./lib/financial-agent.ts');

async function testAIAnalysis() {
  try {
    console.log('Testing AI Analysis...');
    
    // Create a simple agent with test API key
    const agent = new FinancialResearchAgent(
      process.env.OPENAI_API_KEY, 
      null, 
      'gpt-3.5-turbo'
    );
    
    // Test with a simple prompt
    const simplePrompt = "You are a financial research analyst. Analyze the following information about 'ESG investing' and provide comprehensive insights for wealth and asset management.\n\nPlease provide:\n1. Key insights and trends\n2. Investment implications\n3. Risk considerations\n4. Recommendations for wealth management\n5. Academic research implications";
    
    console.log('Testing simple AI analysis...');
    const result = await agent.analyzeWithAI(simplePrompt);
    console.log('AI Analysis result:', result);
    
  } catch (error) {
    console.error('AI Analysis test failed:', error);
    console.error('Error details:', error.response?.data || error.message);
  }
}

testAIAnalysis(); 