// Simple test to check if NextAuth API is working
const testAuth = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/providers');
    const data = await response.json();
    console.log('NextAuth providers:', data);
    
    if (response.ok) {
      console.log('✅ NextAuth API is working!');
    } else {
      console.log('❌ NextAuth API error:', response.status);
    }
  } catch (error) {
    console.log('❌ Failed to connect to NextAuth API:', error.message);
  }
};

testAuth();