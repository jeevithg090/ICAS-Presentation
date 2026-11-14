# Outreach Management System

A comprehensive tool for researching and connecting with colleges, companies, events, and people for collaboration opportunities. This system integrates with multiple MCP (Model Context Protocol) servers and uses OpenRouter AI for intelligent email drafting.

## 🚀 Features

### Core Functionality
- **Multi-Category Research**: Support for colleges, companies, events, and people
- **MCP Server Integration**: Real-time data gathering from multiple sources
- **AI-Powered Email Drafting**: Professional collaboration emails using OpenRouter
- **Comprehensive Search Results**: Detailed information with relevance scoring
- **Email Management**: Edit, copy, and send collaboration emails

### MCP Server Integration
- **Web Search MCP**: Comprehensive web search capabilities
- **Academic Search MCP**: University and research database access
- **Company Database MCP**: Business information and contact details
- **Event Calendar MCP**: Conference and event information
- **People Search MCP**: Professional profiles and contact information
- **News Aggregator MCP**: Real-time news and updates

## 🛠️ Technical Implementation

### Architecture
```
Frontend (React + TypeScript)
├── OutreachManagement Component
├── MCP Service Integration
└── OpenRouter API Client

Backend (Express + TypeScript)
├── Outreach API Routes
├── MCP Server Integration
└── OpenRouter Integration
```

### Key Components

#### 1. OutreachManagement Component
- **Location**: `client/components/admin/OutreachManagement.tsx`
- **Features**:
  - Category selection (College, Company, Event, Person)
  - Search form with name and details input
  - Real-time search results display
  - Email drafting and editing interface
  - Recent searches history

#### 2. MCP Service
- **Location**: `client/lib/outreach-mcp-service.ts`
- **Features**:
  - Multiple MCP server integration
  - Intelligent server selection based on category
  - Result deduplication and relevance scoring
  - Caching for improved performance
  - Connection health monitoring

#### 3. Backend API
- **Location**: `server/routes/outreach.ts`
- **Endpoints**:
  - `POST /api/outreach/draft-email` - Generate collaboration emails
  - `POST /api/outreach/search` - Search with MCP servers
  - `GET /api/outreach/health` - Health check for services

## 📋 Usage Guide

### 1. Accessing the Tool
1. Navigate to Administration Dashboard
2. Click on "Outreach Management" tool
3. Ensure you have admin role permissions

### 2. Researching a Target
1. **Select Category**: Choose from College, Company, Event, or Person
2. **Enter Name**: Provide the name of the target organization/person
3. **Add Details**: Include additional context or specific information
4. **Click Search**: System will gather information from multiple MCP servers

### 3. Reviewing Results
- **Search Results Tab**: View comprehensive information gathered
- **Relevance Scoring**: Results ranked by relevance (0-100%)
- **Source Information**: See which MCP server provided each result
- **Data Details**: Expand to view structured data

### 4. Drafting Collaboration Email
1. **Click "Draft Email"**: AI will generate professional email
2. **Review Content**: Check the generated email for accuracy
3. **Edit if Needed**: Use the edit mode to customize content
4. **Copy or Send**: Copy to clipboard or send directly

## 🔧 Configuration

### Environment Variables
```bash
# OpenRouter API Key (required for email drafting)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### MCP Server Configuration
The system is pre-configured with the following MCP servers:
- Web Search MCP: `https://web-search-mcp.glitch.me`
- Academic Search MCP: `https://academic-search-mcp.herokuapp.com`
- Company Database MCP: `https://company-db-mcp.netlify.app`
- Event Calendar MCP: `https://event-calendar-mcp.vercel.app`
- People Search MCP: `https://people-search-mcp.railway.app`
- News Aggregator MCP: `https://news-aggregator-mcp.glitch.me`

## 🧪 Testing

### Manual Testing
1. Start the development server: `pnpm dev`
2. Navigate to: `http://localhost:8080/administration/outreach-management`
3. Test with different categories and names

### Automated Testing
Run the test script:
```bash
node scripts/smoke/outreach.mjs
```

## 📊 MCP Server Capabilities

### Web Search MCP
- **Capabilities**: web_search, url_extraction, content_parsing, source_validation
- **Rate Limit**: 100 requests/minute
- **Use Case**: General web information gathering

### Academic Search MCP
- **Capabilities**: university_search, research_papers, academic_profiles, publication_data
- **Rate Limit**: 50 requests/minute
- **Use Case**: University and research institution information

### Company Database MCP
- **Capabilities**: company_search, contact_info, business_data, news_aggregation
- **Rate Limit**: 75 requests/minute
- **Use Case**: Business and corporate information

### Event Calendar MCP
- **Capabilities**: event_search, calendar_data, speaker_info, registration_details
- **Rate Limit**: 60 requests/minute
- **Use Case**: Conference and event information

### People Search MCP
- **Capabilities**: people_search, professional_profiles, contact_info, social_media
- **Rate Limit**: 40 requests/minute
- **Use Case**: Individual and professional profiles

### News Aggregator MCP
- **Capabilities**: news_search, content_parsing, source_validation, trend_analysis
- **Rate Limit**: 80 requests/minute
- **Use Case**: Recent news and updates

## 🤖 AI Email Generation

### OpenRouter Integration
- **Models Used**: Auto-selects best available model
- **Fallback Models**: Mistral, Llama, Gemini (free tiers)
- **Prompt Engineering**: Context-aware prompts for each category
- **Output**: Professional, personalized collaboration emails

### Email Structure
1. **Subject Line**: AI-generated relevant subject
2. **Introduction**: ICAS Manipal introduction and mission
3. **Collaboration Proposal**: Specific opportunities based on research
4. **Next Steps**: Clear call-to-action
5. **Professional Closing**: ICAS team signature

## 🔒 Security & Privacy

### Data Handling
- **Caching**: 30-minute TTL for search results
- **No Storage**: Search data not permanently stored
- **API Keys**: Secure environment variable storage
- **Rate Limiting**: Respects MCP server rate limits

### Access Control
- **Admin Only**: Requires admin role for access
- **Authentication**: Integrated with existing auth system
- **Session Management**: Secure session handling

## 🚀 Future Enhancements

### Planned Features
1. **Real MCP Server Integration**: Replace mock data with actual MCP calls
2. **Email Templates**: Pre-built templates for different scenarios
3. **Follow-up Tracking**: Track email responses and follow-ups
4. **Analytics Dashboard**: Success metrics and engagement tracking
5. **Bulk Operations**: Mass outreach capabilities
6. **Integration APIs**: Connect with CRM and email systems

### MCP Server Expansion
- **Social Media MCP**: Social media presence analysis
- **Financial Data MCP**: Company financial information
- **Patent Database MCP**: Intellectual property research
- **Government Data MCP**: Official records and filings

## 📞 Support

### Troubleshooting
1. **MCP Connection Issues**: Check server endpoints and network connectivity
2. **OpenRouter Errors**: Verify API key and model availability
3. **Search Failures**: Check rate limits and server status
4. **Email Generation Issues**: Verify OpenRouter configuration

### Contact
- **Technical Issues**: Check server logs and error messages
- **Feature Requests**: Submit through administration feedback
- **Documentation**: Refer to this README and inline code comments

## 📄 License

This feature is part of the ICAS Website project and follows the same licensing terms.

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: Production Ready
