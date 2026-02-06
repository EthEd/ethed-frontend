// Test the demo login functionality
const testLogin = async () => {
  try {
    console.log('Testing demo login...');
    
    // Test the credentials signin
    const response = await fetch('http://localhost:3001/api/auth/signin/demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'demo@ethed.app',
        name: 'Demo User',
        csrfToken: 'test', // In real app, this would be fetched first
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ Demo login endpoint is working!');
    } else {
      console.log('❌ Demo login failed:', response.status);
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.log('❌ Failed to test login:', error.message);
  }
};

testLogin();