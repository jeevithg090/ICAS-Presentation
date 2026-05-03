# ICAS Platform Environment Variables Example

Create a `.env` file in the root directory with the following variables:

```bash
# ICAS Platform Environment Variables

# Existing API Keys
HUGGING_FACE_TOKEN=your_hugging_face_token_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Alumni Automation API Keys
# Get your SerpAPI key from: https://serpapi.com/
SERP_API_KEY=your_serpapi_key_here

# Get your OpenRouter API key from: https://openrouter.ai/
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Get your HubSpot API key from: https://developers.hubspot.com/
HUBSPOT_API_KEY=your_hubspot_api_key_here

# Get your PhantomBuster API key from: https://hub.phantombuster.com/
PHANTOMBUSTER_API_KEY=your_phantombuster_api_key_here

# Get your PhantomBuster Phantom ID from your LinkedIn Message Sender agent
PHANTOMBUSTER_PHANTOM_ID=your_phantom_id_here

# Other API Keys (if needed)
# GOOGLE_API_KEY=your_google_key_here

# Firebase (client-side, Vite)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id_here
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