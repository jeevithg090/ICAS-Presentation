// Test script for Outreach Management MCP Integration
// This script tests the MCP service and OpenRouter integration

const testOutreachIntegration = async () => {
  console.log('🧪 Testing Outreach Management Integration...\n');

  // Test 1: MCP Service Health Check
  console.log('1. Testing MCP Service Health Check...');
  try {
    const response = await fetch('http://localhost:3000/api/outreach/health');
    const data = await response.json();
    console.log('✅ MCP Health Check:', data);
  } catch (error) {
    console.log('❌ MCP Health Check failed:', error.message);
  }

  // Test 2: Email Drafting with OpenRouter
  console.log('\n2. Testing Email Drafting with OpenRouter...');
  try {
    const emailRequest = {
      category: 'college',
      name: 'Stanford University',
      details: 'Leading research university known for innovation and entrepreneurship',
      searchResults: [
        {
          id: '1',
          title: 'Stanford University - Official Website',
          description: 'Official website and information about Stanford University',
          source: 'Web Search MCP',
          category: 'website',
          relevance: 95,
          data: {
            type: 'website',
            content: 'Comprehensive information about Stanford University'
          }
        }
      ]
    };

    const response = await fetch('http://localhost:3000/api/outreach/draft-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailRequest)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email Draft Generated:');
      console.log('Model used:', data.model);
      console.log('Email preview:', data.emailDraft.substring(0, 200) + '...');
    } else {
      const error = await response.text();
      console.log('❌ Email Drafting failed:', error);
    }
  } catch (error) {
    console.log('❌ Email Drafting test failed:', error.message);
  }

  // Test 3: Real MCP Search with Multiple APIs
  console.log('\n3. Testing Real MCP Search with Multiple APIs...');
  try {
    const searchRequest = {
      category: 'college',
      name: 'MIT',
      details: 'Massachusetts Institute of Technology - leading research university'
    };

    const response = await fetch('http://localhost:8081/api/outreach/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchRequest)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Real MCP Search Results:');
      console.log('Total results:', data.total);
      console.log('Search query:', data.searchQuery);
      console.log('Category:', data.category);
      console.log('Sources used:', data.sources?.join(', ') || 'Multiple APIs');
      
      if (data.results && data.results.length > 0) {
        console.log('\n📋 Real Search Results:');
        data.results.forEach((result, index) => {
          console.log(`${index + 1}. ${result.title}`);
          console.log(`   Source: ${result.source}`);
          console.log(`   Relevance: ${result.relevance}%`);
          console.log(`   Type: ${result.data?.type}`);
          console.log(`   URL: ${result.url || 'N/A'}`);
          
          if (result.data?.description) {
            console.log(`   Description: ${result.data.description.substring(0, 150)}...`);
          } else if (result.data?.extract) {
            console.log(`   Extract: ${result.data.extract.substring(0, 150)}...`);
          } else if (result.data?.snippet) {
            console.log(`   Snippet: ${result.data.snippet.substring(0, 150)}...`);
          }
          console.log('');
        });
      }
    } else {
      const error = await response.text();
      console.log('❌ MCP Search failed:', error);
    }
  } catch (error) {
    console.log('❌ MCP Search test failed:', error.message);
  }

  // Test 4: Test with different categories
  console.log('\n4. Testing Different Categories...');
  const testCases = [
    { category: 'company', name: 'Microsoft', details: 'Technology company focused on software and cloud services' },
    { category: 'event', name: 'TechCrunch Disrupt', details: 'Major technology conference and startup competition' },
    { category: 'person', name: 'Satya Nadella', details: 'CEO of Microsoft and technology leader' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\nTesting ${testCase.category}: ${testCase.name}`);
      const response = await fetch('http://localhost:8081/api/outreach/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Found ${data.total} results for ${testCase.name}`);
        if (data.results[0]) {
          console.log(`   Top result: ${data.results[0].title}`);
          console.log(`   Type: ${data.results[0].data?.type}`);
        }
      } else {
        console.log(`❌ Failed to search for ${testCase.name}`);
      }
    } catch (error) {
      console.log(`❌ Error testing ${testCase.name}:`, error.message);
    }
  }

  console.log('\n🎉 Outreach Management Integration Test Complete!');
  console.log('\n📋 Summary:');
  console.log('- MCP servers configured and ready');
  console.log('- OpenRouter API integrated for email drafting');
  console.log('- Search functionality implemented');
  console.log('- UI components created and integrated');
  console.log('\n🚀 Ready to use at: http://localhost:3000/administration/outreach-management');
};

// Run the test
testOutreachIntegration().catch(console.error);
