// Test NFT minting API
const testNFT = async () => {
  try {
    console.log('Testing NFT minting...');
    
    const response = await fetch('http://localhost:3001/api/user/nfts/genesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        petId: 'pet-123',
        ensName: 'test-user.ethed.eth',
        buddyType: 'spark-dragon'
      }),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ NFT minting API is working!');
    } else {
      console.log('❌ NFT minting failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Failed to test NFT API:', error.message);
  }
};

testNFT();