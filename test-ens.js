// Test ENS registration API
const testENS = async () => {
  try {
    console.log('Testing ENS registration...');
    
    // Test valid ENS name
    const response = await fetch('http://localhost:3001/api/ens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subdomain: 'test-user-123',
        buddyId: 'spark-dragon'
      }),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ ENS registration API is working!');
    } else {
      console.log('❌ ENS registration failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Failed to test ENS API:', error.message);
  }
};

testENS();