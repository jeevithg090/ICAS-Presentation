#!/usr/bin/env node

/**
 * Test script for PhantomBuster LinkedIn messaging integration
 * Run this script to test the API endpoint without the full UI
 */

const axios = require('axios');

// Configuration - update these values
const config = {
  baseUrl: 'http://localhost:3000',
  phantomBusterApiKey: process.env.PHANTOMBUSTER_API_KEY || '2DcVm9VXgRBXAby7E8fYaaLyhOp0szJ34ALbzXgKRWs',
  phantomBusterPhantomId: process.env.PHANTOMBUSTER_PHANTOM_ID || 'YOUR_PHANTOM_ID'
};

async function testPhantomBusterIntegration() {
  console.log('🧪 Testing PhantomBuster LinkedIn Messaging Integration\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await axios.get(`${config.baseUrl}/api/alumni/status`);
    console.log('✅ Server is running\n');
    
    // Test 2: Test LinkedIn profile search
    console.log('2️⃣ Testing LinkedIn profile search...');
    const searchResponse = await axios.post(`${config.baseUrl}/api/alumni/search-linkedin`, {
      name: 'John Smith'
    });
    console.log('✅ LinkedIn search successful');
    console.log(`   Found profile: ${searchResponse.data.linkedinUrl}`);
    console.log(`   Company: ${searchResponse.data.company || 'N/A'}`);
    console.log(`   Title: ${searchResponse.data.title || 'N/A'}\n`);
    
    // Test 3: Test AI message generation
    console.log('3️⃣ Testing AI message generation...');
    const messageResponse = await axios.post(`${config.baseUrl}/api/alumni/generate-message`, {
      name: 'John Smith',
      profile: searchResponse.data,
      customMessage: 'Generate a professional outreach message'
    });
    console.log('✅ AI message generation successful');
    console.log(`   Generated message: ${messageResponse.data.message.substring(0, 100)}...\n`);
    
    // Test 4: Test PhantomBuster LinkedIn messaging
    console.log('4️⃣ Testing PhantomBuster LinkedIn messaging...');
    const linkedinResponse = await axios.post(`${config.baseUrl}/api/alumni/send-linkedin-message`, {
      name: 'John Smith',
      linkedinUrl: searchResponse.data.linkedinUrl,
      message: messageResponse.data.message
    });
    console.log('✅ PhantomBuster integration successful');
    console.log(`   Message ID: ${linkedinResponse.data.messageId}`);
    console.log(`   Phantom ID: ${linkedinResponse.data.phantomBusterId}`);
    console.log(`   Status: ${linkedinResponse.data.status}\n`);
    
    // Test 5: Test HubSpot integration
    console.log('5️⃣ Testing HubSpot integration...');
    const hubspotResponse = await axios.post(`${config.baseUrl}/api/alumni/send-hubspot`, {
      name: 'John Smith',
      profile: searchResponse.data,
      message: messageResponse.data.message
    });
    console.log('✅ HubSpot integration successful');
    console.log(`   Contact ID: ${hubspotResponse.data.contactId}`);
    console.log(`   Message ID: ${hubspotResponse.data.messageId}\n`);
    
    console.log('🎉 All tests passed! Your PhantomBuster integration is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('   1. Set up your real PhantomBuster agent');
    console.log('   2. Update PHANTOMBUSTER_PHANTOM_ID in your .env file');
    console.log('   3. Test with real LinkedIn profiles');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure your server is running on port 3000');
    console.log('   2. Check your API keys in the .env file');
    console.log('   3. Verify your PhantomBuster configuration');
  }
}

// Run the test
if (require.main === module) {
  testPhantomBusterIntegration();
}

module.exports = { testPhantomBusterIntegration }; 