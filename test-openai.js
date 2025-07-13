const axios = require('axios');

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    
    // Test with a simple prompt
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "user",
          content: "Hello, this is a test message. Please respond with 'Test successful'."
        }
      ],
      temperature: 0.1,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('OpenAI API test successful!');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.error('OpenAI API test failed:', error.response?.data || error.message);
  }
}

testOpenAI(); 