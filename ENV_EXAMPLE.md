# ICAS Platform Environment Variables Example

Create a `.env` file in the root directory with the following variables:

```bash
# ICAS Platform Environment Variables

# Existing API Keys
HUGGING_FACE_TOKEN=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
ELEVENLABS_API_KEY=sk_934ff060c3f818fee95b23a838f20e3c98ca469c850b0d01

# Server Configuration
PORT=3000
NODE_ENV=development

# Alumni Automation API Keys
# Get your SerpAPI key from: https://serpapi.com/
SERP_API_KEY=7f27008676856577a9c21d70d5e36e64e972d78e6f6ea7133ea5629ae825216c

# Get your OpenRouter API key from: https://openrouter.ai/
OPENROUTER_API_KEY=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

# Get your HubSpot API key from: https://developers.hubspot.com/
HUBSPOT_API_KEY=na2-bdd9-3664-43fa-968d-e37c45107224

# Get your PhantomBuster API key from: https://hub.phantombuster.com/
PHANTOMBUSTER_API_KEY=2DcVm9VXgRBXAby7E8fYaaLyhOp0szJ34ALbzXgKRWs

# Get your PhantomBuster Phantom ID from your LinkedIn Message Sender agent
PHANTOMBUSTER_PHANTOM_ID=your_phantom_id_here

# Other API Keys (if needed)
# GOOGLE_API_KEY=your_google_key_here
```

## How to Get API Keys

### SerpAPI (LinkedIn Search)
1. Go to [SerpAPI](https://serpapi.com/)
2. Sign up for an account
3. Get your API key from the dashboard
4. SerpAPI offers 100 free searches per month

### OpenRouter (AI Message Generation)
1. Go to [OpenRouter](https://openrouter.ai/)
1. Sign up for an account
2. Get your API key from the dashboard
3. OpenRouter offers free credits for new users

### HubSpot (CRM Integration)
1. Go to [HubSpot Developers](https://developers.hubspot.com/)
2. Create a developer account
3. Create a private app
4. Get your API key from the app settings

## Notes
- The platform will work in demo mode without these API keys
- Demo mode provides mock data for testing
- For production use, all API keys are required
- Never commit your `.env` file to version control 