const fetch = require('node-fetch');

async function testSimpleResearch() {
  try {
    console.log('Testing simple research API (no LangSmith)...');
    
    const response = await fetch('http://localhost:3000/api/research/simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'ESG investing strategies',
        includeWebSearch: false,
        includeAcademicResearch: false,
        includeMarketData: false,
        openaiApiKey: process.env.OPENAI_API_KEY || 'test-key',
        model: 'gpt-3.5-turbo'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Simple research API test successful!');
      console.log('Use LangSmith:', data.useLangSmith);
      console.log('Query:', data.query);
      console.log('Model:', data.model);
      console.log('Results:', JSON.stringify(data.results, null, 2));
    } else {
      console.log('❌ Simple research API test failed!');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testSimpleResearch(); 