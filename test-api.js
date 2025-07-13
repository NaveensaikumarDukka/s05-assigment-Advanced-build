const fetch = require('node-fetch');

async function testResearchAPI() {
  try {
    console.log('Testing research API...');
    
    const response = await fetch('http://localhost:3000/api/research', {
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
      console.log('✅ Research API test successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Research API test failed!');
      console.log('Status:', response.status);
      console.log('Error:', data);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testResearchAPI(); 