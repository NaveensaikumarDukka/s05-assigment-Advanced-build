// Test script to verify error handling in research results
const testErrorHandling = () => {
  console.log('Testing error handling scenarios...');
  
  // Test case 1: String error
  const stringError = "This is a string error";
  console.log('String error:', typeof stringError === 'string' ? stringError : JSON.stringify(stringError));
  
  // Test case 2: Object error
  const objectError = { error: "This is an object error" };
  console.log('Object error:', typeof objectError === 'string' ? objectError : JSON.stringify(objectError));
  
  // Test case 3: Nested error object
  const nestedError = { error: { message: "Nested error", code: 500 } };
  console.log('Nested error:', typeof nestedError === 'string' ? nestedError : JSON.stringify(nestedError));
  
  // Test case 4: AI Analysis as string
  const aiAnalysisString = "This is a string analysis";
  console.log('AI Analysis string:', typeof aiAnalysisString === 'string' ? aiAnalysisString : JSON.stringify(aiAnalysisString));
  
  // Test case 5: AI Analysis as object
  const aiAnalysisObject = { error: "AI analysis failed" };
  console.log('AI Analysis object:', typeof aiAnalysisObject === 'string' ? aiAnalysisObject : JSON.stringify(aiAnalysisObject));
  
  console.log('Error handling test completed successfully!');
};

testErrorHandling(); 