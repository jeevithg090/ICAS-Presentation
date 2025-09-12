# Alumni Automation Feature

The Alumni Automation feature is a powerful tool that automates the process of reaching out to university alumni. It combines LinkedIn profile search, AI-powered message generation, and HubSpot CRM integration to streamline alumni outreach campaigns.

## Features

### 🔍 LinkedIn Profile Search
- **SerpAPI Integration**: Automatically search for alumni profiles on LinkedIn
- **Professional Information Extraction**: Extract company, job title, and location data
- **Profile Validation**: Ensure found profiles match the search criteria

### 🤖 AI Message Generation
- **OpenRouter Integration**: Use free LLM models for message generation
- **Personalized Content**: Generate context-aware messages based on alumni profile
- **Custom Prompts**: Option to provide custom message templates or prompts
- **Professional Tone**: Ensure all generated messages maintain professional standards

### 📧 HubSpot CRM Integration
- **Contact Management**: Automatically create or update alumni contacts
- **Message Tracking**: Track sent messages and responses
- **Pipeline Management**: Integrate with HubSpot sales pipelines
- **Response Monitoring**: Monitor and display alumni replies

## How It Works

### 1. Alumni Search
1. Enter the alumni's full name in the admin interface
2. The system searches LinkedIn using SerpAPI
3. Extracts professional information (company, title, location)
4. Validates the profile matches the search criteria

### 2. AI Message Generation
1. Uses the extracted profile information to generate context
2. Calls OpenRouter API with a professional prompt
3. Generates a personalized outreach message
4. Option to customize the message generation prompt

### 3. LinkedIn Message Sending
1. Uses PhantomBuster API to send messages directly to alumni
2. Automatically navigates to the alumni's LinkedIn profile
3. Sends the AI-generated personalized message
4. Tracks message delivery and status

### 4. HubSpot CRM Integration
1. Creates or updates the alumni contact in HubSpot
2. Tracks the entire outreach process
3. Monitors for responses and engagement
4. Provides comprehensive analytics and reporting

## Setup Requirements

### API Keys Required

#### SerpAPI (LinkedIn Search)
- **Purpose**: Search LinkedIn profiles and extract professional information
- **Get Key**: [SerpAPI Dashboard](https://serpapi.com/)
- **Cost**: 100 free searches per month, then $50/month for 5,000 searches
- **Setup**: Add `SERP_API_KEY=your_key_here` to your `.env` file

#### OpenRouter (AI Message Generation)
- **Purpose**: Generate personalized outreach messages using AI
- **Get Key**: [OpenRouter Dashboard](https://openrouter.ai/)
- **Cost**: Free credits for new users, then pay-per-use
- **Setup**: Add `OPENROUTER_API_KEY=your_key_here` to your `.env` file

#### HubSpot (CRM Integration)
- **Purpose**: Manage contacts and send messages
- **Get Key**: [HubSpot Developers](https://developers.hubspot.com/)
- **Cost**: Free tier available, paid plans for advanced features
- **Setup**: Add `HUBSPOT_API_KEY=your_key_here` to your `.env` file

#### PhantomBuster (LinkedIn Messaging)
- **Purpose**: Send messages directly to alumni on LinkedIn
- **Get Key**: [PhantomBuster Hub](https://hub.phantombuster.com/)
- **Cost**: Various plans available, pay-per-use model
- **Setup**: Add `PHANTOMBUSTER_API_KEY=your_key_here` to your `.env` file

### Environment Variables
```bash
# Alumni Automation API Keys
SERP_API_KEY=your_serp_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
HUBSPOT_API_KEY=your_hubspot_api_key_here
PHANTOMBUSTER_API_KEY=your_phantombuster_api_key_here
```

## Usage

### Accessing the Feature
1. Navigate to `/admin` in your application
2. Scroll down to the "Alumni Automation" section
3. Enter an alumni name and optionally a custom message prompt
4. Click "Start Alumni Automation"

### Workflow Steps
1. **LinkedIn Profile Search**: System searches for the alumni profile
2. **AI Message Generation**: Creates a personalized outreach message
3. **LinkedIn Message Sending**: Sends message directly to alumni via PhantomBuster
4. **HubSpot CRM Integration**: Tracks contact and entire outreach process
5. **Status Monitoring**: Tracks the entire process and displays results

### Customization Options
- **Custom Message Prompts**: Provide specific instructions for AI message generation
- **Profile Information**: Use extracted LinkedIn data for personalization
- **Message Templates**: Create reusable message templates for different scenarios

## API Endpoints

### Search LinkedIn Profile
```http
POST /api/alumni/search-linkedin
Content-Type: application/json

{
  "name": "John Smith"
}
```

**Response:**
```json
{
  "linkedinUrl": "https://linkedin.com/in/john-smith",
  "company": "Tech Corp",
  "title": "Senior Software Engineer",
  "location": "San Francisco, CA"
}
```

### Generate AI Message
```http
POST /api/alumni/generate-message
Content-Type: application/json

{
  "name": "John Smith",
  "profile": {
    "company": "Tech Corp",
    "title": "Senior Software Engineer"
  },
  "customMessage": "Optional custom prompt"
}
```

**Response:**
```json
{
  "message": "Hi John! I hope this message finds you well..."
}
```

### Send LinkedIn Message via PhantomBuster
```http
POST /api/alumni/send-linkedin-message
Content-Type: application/json

{
  "name": "John Smith",
  "linkedinUrl": "https://linkedin.com/in/john-smith",
  "message": "Generated or custom message"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg_1234567890",
  "status": "message_sent",
  "phantomBusterId": "container_12345",
  "note": "LinkedIn message sent successfully via PhantomBuster"
}
```

### Send via HubSpot
```http
POST /api/alumni/send-hubspot
Content-Type: application/json

{
  "name": "John Smith",
  "profile": {
    "company": "Tech Corp",
    "title": "Senior Software Engineer"
  },
  "message": "Generated or custom message"
}
```

**Response:**
```json
{
  "success": true,
  "contactId": "12345",
  "messageId": "msg_1234567890",
  "status": "sent"
}
```

### Get Status
```http
GET /api/alumni/status
```

**Response:**
```json
{
  "totalProcessed": 10,
  "pending": 2,
  "completed": 7,
  "failed": 1
}
```

## Demo Mode

The system includes a demo mode that works without API keys:

- **LinkedIn Search**: Returns real profile data (SerpAPI working)
- **AI Message Generation**: Uses real AI (OpenRouter working)
- **LinkedIn Messaging**: Simulates message sending (PhantomBuster ready)
- **HubSpot Integration**: Simulates successful contact creation

This allows you to test the interface and workflow before setting up the PhantomBuster agent for real LinkedIn messaging.

## Error Handling

### Common Issues
1. **Profile Not Found**: LinkedIn profile doesn't exist or is private
2. **API Rate Limits**: Exceeded API usage limits
3. **Invalid API Keys**: Incorrect or expired API keys
4. **Network Issues**: Connection problems with external APIs

### Fallback Mechanisms
- **Mock Data**: Demo mode provides realistic test data
- **Template Messages**: Fallback to pre-written message templates
- **Error Logging**: Comprehensive error logging for debugging

## Security Considerations

- **API Key Protection**: Never expose API keys in client-side code
- **Rate Limiting**: Implement rate limiting to prevent API abuse
- **Data Privacy**: Ensure compliance with LinkedIn and HubSpot terms of service
- **User Permissions**: Restrict access to admin users only

## Monitoring and Analytics

### Status Tracking
- **Process Status**: Real-time updates on automation progress
- **Success Rates**: Track successful vs. failed automation attempts
- **Response Rates**: Monitor alumni response rates
- **Performance Metrics**: Track processing times and API usage

### Dashboard Features
- **Progress Indicators**: Visual progress bars for each step
- **Status Badges**: Color-coded status indicators
- **Error Reporting**: Detailed error messages and troubleshooting tips
- **History View**: Track all processed alumni profiles

## Future Enhancements

### Planned Features
- **Batch Processing**: Process multiple alumni simultaneously
- **Advanced Analytics**: Detailed reporting and insights
- **Integration Options**: Support for additional CRM platforms
- **Message Templates**: Library of customizable message templates
- **Response Analysis**: AI-powered analysis of alumni responses

### API Improvements
- **Webhook Support**: Real-time updates for responses
- **Advanced Search**: More sophisticated LinkedIn profile matching
- **Message Scheduling**: Schedule messages for optimal timing
- **A/B Testing**: Test different message approaches

## Support and Troubleshooting

### Getting Help
1. Check the browser console for error messages
2. Verify all API keys are correctly configured
3. Ensure network connectivity to external APIs
4. Check API usage limits and quotas

### Common Solutions
- **API Key Issues**: Regenerate and update API keys
- **Rate Limiting**: Wait for rate limit reset or upgrade API plan
- **Profile Not Found**: Try variations of the name or check spelling
- **HubSpot Errors**: Verify HubSpot account permissions and API access

## Contributing

To contribute to the Alumni Automation feature:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This feature is part of the ICAS platform and follows the same licensing terms. 