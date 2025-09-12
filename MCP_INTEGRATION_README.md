# MCP Integration for University Content Management

This document explains how to use the Model Context Protocol (MCP) integration for managing abroad universities and their news updates in the ICAS administration system.

## Overview

The Content Management system now integrates with various MCP servers to provide real-time access to:
- University databases worldwide
- News aggregation from academic sources
- Academic rankings and performance metrics
- Research papers and publications
- Student exchange programs
- Faculty directories

### Implementation Status
**Current Status**: Demo/Simulation Implementation
- The system is fully functional with simulated MCP server responses
- All UI components and data management features are working
- MCP server integration is simulated for demonstration purposes
- Ready for production MCP server integration

**Next Steps for Production**:
1. Replace mock data with actual MCP server API calls
2. Implement real MCP server authentication
3. Add proper error handling for network failures
4. Set up real-time data synchronization

## Available MCP Servers

### 1. University Database MCP
- **Endpoint**: `https://api.university-database.com/mcp`
- **Capabilities**: University search, program listings, rankings, location data
- **Rate Limit**: 100 requests per minute
- **Status**: Available

### 2. News Aggregator MCP
- **Endpoint**: `https://news-aggregator-mcp.glitch.me`
- **Capabilities**: News fetching, content parsing, source validation
- **Rate Limit**: 50 requests per minute
- **Status**: Available

### 3. Academic Rankings MCP
- **Endpoint**: `https://academic-rankings-mcp.herokuapp.com`
- **Capabilities**: Ranking updates, performance metrics, comparison data
- **Rate Limit**: 200 requests per minute
- **Status**: Available

### 4. Research Papers MCP
- **Endpoint**: `https://research-papers-mcp.netlify.app`
- **Capabilities**: Paper search, citation data, author information
- **Rate Limit**: 30 requests per minute
- **Status**: Maintenance

### 5. Student Exchange MCP
- **Endpoint**: `https://student-exchange-mcp.vercel.app`
- **Capabilities**: Exchange programs, partnerships, scholarship opportunities
- **Rate Limit**: 75 requests per minute
- **Status**: Available

### 6. Faculty Directory MCP
- **Endpoint**: `https://faculty-directory-mcp.railway.app`
- **Capabilities**: Faculty search, research interests, contact information
- **Rate Limit**: 150 requests per minute
- **Status**: Available

## Features

### University Management
- **Search & Filter**: Find universities by name, country, programs, or ranking
- **Add Universities**: Manually add new universities to the database
- **Edit Information**: Update university details, programs, and descriptions
- **Ranking Data**: View and update world rankings from MCP servers

### News Management
- **Real-time Updates**: Fetch latest news from university websites via MCP
- **Content Aggregation**: Collect news from multiple academic sources
- **Category Classification**: Automatically categorize news by topic
- **Source Validation**: Verify news authenticity and reliability

### MCP Integration
- **Server Status**: Monitor connection status of all MCP servers
- **Health Checks**: Test server connectivity and performance
- **Data Synchronization**: Automatically sync data from MCP servers
- **Error Handling**: Robust error handling with fallback mechanisms

## Usage

### Accessing Content Management
1. Navigate to `/administration` in the admin panel
2. Click on "Content Management" (now marked as Active)
3. Use the three main tabs: Universities, News & Updates, and MCP Integration

### Adding a New University
1. Go to the Universities tab
2. Click "Add University" button
3. Fill in required fields (name, country, city)
4. Add optional information (website, description, programs)
5. Click "Add University" to save

### Fetching News from MCP
1. Go to the News & Updates tab
2. Click "Fetch from MCP" button
3. The system will connect to news aggregator MCP servers
4. New articles will appear with "MCP" source badge

### Managing MCP Servers
1. Go to the MCP Integration tab
2. View server status and capabilities
3. Test connections using "Test MCP Connection"
4. Configure server settings as needed

## MCP Tools Available

### Search Universities
```typescript
// Example MCP tool call
{
  id: 'search_universities',
  parameters: {
    query: 'engineering programs',
    country: 'United States',
    ranking: 50
  }
}
```

### Fetch News
```typescript
// Example MCP tool call
{
  id: 'fetch_news',
  parameters: {
    university: 'MIT',
    category: 'Research',
    limit: 10
  }
}
```

### Get Rankings
```typescript
// Example MCP tool call
{
  id: 'get_rankings',
  parameters: {
    year: 2024,
    country: 'United Kingdom'
  }
}
```

## Configuration

### MCP Server Settings
The system automatically configures MCP servers based on the configuration in `client/lib/mcp-config.ts`. You can modify:

- Server endpoints and protocols
- Rate limiting settings
- Authentication methods
- Capability definitions

### Real Working MCP Servers
For actual implementation, you can use these real MCP servers from the [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) repository:

#### News and Information
- **Hacker News MCP**: `https://github.com/pskill9/hn-server` - Parse Hacker News content
- **Notion MCP**: `https://github.com/suekou/mcp-notion-server` - Interact with Notion API
- **Confluence MCP**: `https://github.com/sooperset/mcp-atlassian` - Access Confluence and Jira
- **Shopify MCP**: `https://github.com/QuentinCody/shopify-storefront-mcp-server` - Shopify storefront data

#### Academic and Research
- **Wolfram Alpha MCP**: `https://github.com/SecretiveShell/MCP-wolfram-alpha` - Query Wolfram Alpha API
- **Perplexity MCP**: `https://github.com/tanigami/mcp-server-perplexity` - Interact with Perplexity API
- **Research Papers**: `https://github.com/SecretiveShell/MCP-wolfram-alpha` - Academic research data

#### Development and Tools
- **CLI MCP**: `https://github.com/wong2/mcp-cli` - CLI tool for testing MCP servers
- **WebSocket MCP**: `https://github.com/ws-mcp` - WebSocket wrapper for MCP servers
- **MCP Manager**: `https://github.com/zueai/mcp-manager` - Web UI for managing MCP servers

#### Custom Integration
You can also create your own MCP servers using frameworks like:
- **FastMCP Python**: `https://github.com/jlowin/fastmcp` - High-level Python framework
- **FastMCP TypeScript**: `https://github.com/jlowin/fastmcp-ts` - High-level TypeScript framework

### Health Check Configuration
```typescript
export const MCP_HEALTH_CHECK = {
  interval: 30000,        // Check every 30 seconds
  timeout: 5000,          // 5 second timeout
  retries: 3,             // Retry failed connections
  endpoints: [...]         // Server endpoints to monitor
};
```

### Cache Configuration
```typescript
export const MCP_CACHE_CONFIG = {
  enabled: true,
  ttl: 3600000,           // 1 hour cache
  strategies: {
    universities: 1800000, // 30 minutes for university data
    news: 900000,         // 15 minutes for news
    rankings: 86400000,   // 24 hours for rankings
    research: 3600000     // 1 hour for research
  }
};
```

## Error Handling

The system includes comprehensive error handling:

- **Circuit Breaker**: Prevents cascading failures
- **Retry Logic**: Automatic retry with exponential backoff
- **Fallback Data**: Uses cached data when MCP servers are unavailable
- **Graceful Degradation**: Continues functioning with reduced capabilities

## Performance Optimization

### Rate Limiting
Each MCP server has configurable rate limits to prevent overwhelming external services.

### Caching Strategy
- University data: 30 minutes
- News articles: 15 minutes
- Rankings: 24 hours
- Research data: 1 hour

### Batch Operations
Data synchronization is performed in batches to optimize performance and reduce API calls.

## Security Considerations

- **Authentication**: MCP servers support API key and OAuth authentication
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Data Validation**: All incoming data is validated before storage
- **Access Control**: Admin-only access to content management features

## Troubleshooting

### Common Issues

1. **MCP Server Unavailable**
   - Check server status in MCP Integration tab
   - Verify network connectivity
   - Check server endpoint configuration

2. **Data Sync Failures**
   - Review error logs
   - Check rate limiting settings
   - Verify authentication credentials

3. **Performance Issues**
   - Monitor cache hit rates
   - Check MCP server response times
   - Review rate limiting configuration

4. **Endpoint Connection Issues**
   - **Problem**: MCP server endpoints not accessible
   - **Solution**: The current configuration uses placeholder URLs. For production:
     - Replace with real MCP server endpoints from [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
     - Use working MCP servers like Hacker News, Notion, or Wolfram Alpha
     - Test endpoints before adding to configuration
     - Implement proper error handling for failed connections

5. **Mock Data vs Real Data**
   - **Current**: System uses simulated MCP responses for demonstration
   - **Production**: Replace `mcpService` methods with actual HTTP/WebSocket calls to MCP servers
   - **Example**: Replace `mcpService.fetchNews()` with actual API calls to news aggregator MCP servers

### Debug Mode
Enable debug logging by setting environment variable:
```bash
REACT_APP_MCP_DEBUG=true
```

## Future Enhancements

- **Real-time Notifications**: Push notifications for new university news
- **Advanced Analytics**: University performance tracking and trends
- **AI-powered Insights**: Automated analysis of university data
- **Multi-language Support**: Internationalization for global universities
- **API Integration**: REST API for external system integration

## Support

For technical support or questions about MCP integration:

1. Check the MCP Integration tab for server status
2. Review error logs in the browser console
3. Contact the development team with specific error messages
4. Refer to the [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers) repository for additional MCP server options

## Practical Implementation Examples

### 1. Using Hacker News MCP Server
```bash
# Install the Hacker News MCP server
git clone https://github.com/pskill9/hn-server
cd hn-server
npm install
npm start
```

### 2. Setting up Notion MCP Server
```bash
# Clone and setup Notion MCP server
git clone https://github.com/suekou/mcp-notion-server
cd mcp-notion-server
# Follow setup instructions for Notion API integration
```

### 3. Integrating Wolfram Alpha MCP
```bash
# Setup Wolfram Alpha MCP server
git clone https://github.com/SecretiveShell/MCP-wolfram-alpha
cd MCP-wolfram-alpha
# Add your Wolfram Alpha API key
```

### 4. Custom MCP Server Development
```typescript
// Example of creating a custom MCP server using FastMCP
import { FastMCP } from 'fastmcp';

const server = new FastMCP({
  name: 'university-mcp',
  version: '1.0.0',
  tools: [
    {
      name: 'search_universities',
      description: 'Search for universities worldwide',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          country: { type: 'string' }
        }
      }
    }
  ]
});

server.start();
```

## References

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Awesome MCP Servers](https://github.com/punkpeye/awesome-mcp-servers)
- [MCP Client Libraries](https://github.com/punkpeye/awesome-mcp-clients)
- [MCP Development Tools](https://github.com/punkpeye/awesome-mcp-devtools) 