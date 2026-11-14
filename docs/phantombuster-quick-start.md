# PhantomBuster LinkedIn Messaging - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Create PhantomBuster Account
1. Go to [PhantomBuster Hub](https://hub.phantombuster.com/)
2. Sign up for an account
3. Get your API key from the dashboard

### 2. Install LinkedIn Message Sender
1. Search for "LinkedIn Message Sender" in the store
2. Click "Install" and configure it
3. Copy the Phantom ID from the configuration

### 3. Update Your Environment
Add these to your `.env` file:

```bash
PHANTOMBUSTER_API_KEY=your_api_key_here
PHANTOMBUSTER_PHANTOM_ID=your_phantom_id_here
```

### 4. Test the Integration
1. Start your server: `npm run dev`
2. Go to `/admin` in your browser
3. Use the Alumni Automation tool
4. Enter an alumni name and watch the magic happen!

## 🔧 What Happens

1. **Search**: Finds alumni on LinkedIn
2. **Generate**: Creates personalized AI message
3. **Send**: Automatically sends message via PhantomBuster
4. **Track**: Records everything in your system

## 📱 Demo Mode

The system works in demo mode without real PhantomBuster setup:
- Simulates all API calls
- Shows the complete workflow
- Perfect for testing and development

## 🎯 Production Setup

When ready for real use:
1. Set up LinkedIn session in PhantomBuster
2. Configure your phantom with proper delays
3. Test with a few profiles first
4. Monitor LinkedIn account health

## 🆘 Need Help?

- Check the full setup guide: `PHANTOMBUSTER_SETUP.md`
- Run the test script: `node scripts/smoke/phantombuster.mjs`
- Review server logs for detailed error messages

---

**Ready to automate your alumni outreach?** 🎉 