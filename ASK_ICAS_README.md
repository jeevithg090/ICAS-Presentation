# Ask ICAS - AI Assistant Feature

## Overview
Ask ICAS is an intelligent AI assistant that provides comprehensive information about ICAS Manipal (International Centre for Applied Sciences). It uses OpenRouter's free LLM models to answer questions about programs, admission, campus facilities, student life, and more.

## Features

### 🤖 AI-Powered Chat Interface
- **Real-time Chat**: Interactive chat interface with the ICAS AI assistant
- **Comprehensive Knowledge**: Trained on extensive ICAS information and features
- **Context-Aware Responses**: Provides detailed and accurate answers based on ICAS context
- **Multiple LLM Support**: Uses free OpenRouter models with fallback options

### 🎨 Dark Mode Compatible
- **Theme Integration**: Fully compatible with the application's dark/light theme system
- **Responsive Design**: Works seamlessly across all device sizes
- **Modern UI**: Clean and intuitive user interface

### 🚀 Quick Actions
- **Program Information**: Quick access to program and specialization details
- **Admission Process**: Information about application requirements and process
- **International Transfer**: Details about transfer programs and partner universities
- **Campus Facilities**: Information about campus infrastructure and facilities
- **Student Life**: Details about clubs, activities, and student experiences
- **Financial Information**: Fee structures and scholarship opportunities
- **Events & Activities**: Information about campus events and programs
- **Contact Information**: Ways to get in touch with ICAS

## Technical Implementation

### Backend (Server)
- **Route**: `/api/ask-icas`
- **Method**: POST
- **OpenRouter Integration**: Uses free LLM models (Mistral, Llama, Gemini)
- **Comprehensive Context**: Includes detailed ICAS information from `icasfeatures.md`
- **Error Handling**: Robust error handling with fallback models

### Frontend (Client)
- **Component**: `AskICAS.tsx`
- **Page**: `/ask-icas`
- **Theme Support**: Full dark/light mode compatibility
- **Real-time Chat**: Live chat interface with message history
- **Quick Actions**: Pre-defined question buttons for common queries

### API Integration
```typescript
// Example API call
const response = await fetch('/api/ask-icas', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: 'What programs are available at ICAS?',
    context: 'User is asking about ICAS programs'
  }),
});
```

## Usage

### For Users
1. Navigate to `/ask-icas` or click "Ask ICAS" in the navigation
2. Type your question in the chat input
3. Use quick action buttons for common questions
4. Get comprehensive answers about ICAS Manipal

### For Developers
1. The component is fully integrated into the app routing
2. Backend route is automatically registered in the server
3. Uses existing theme system for consistent styling
4. OpenRouter API key required in environment variables

## Configuration

### Environment Variables
```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### OpenRouter Models Used
- `mistralai/mistral-7b-instruct` (Primary free model)
- `meta-llama/llama-3.1-8b-instruct` (Fallback free model)
- `google/gemini-pro` (Fallback free model)
- `openrouter/auto` (Auto-selects best available)

## Context Information
The AI assistant has access to comprehensive information about:
- Program overview and specializations
- Admission requirements and process
- International transfer programs
- Campus facilities and infrastructure
- Student life and activities
- Career opportunities and alumni network
- Financial information and scholarships
- Research and development opportunities
- International partnerships
- Contact information and support services

## Integration Points
- **Navigation**: Integrated into the main navigation and AiNavBot
- **Theme System**: Uses the application's theme provider
- **Routing**: Added to the main app routing system
- **UI Components**: Uses existing UI component library

## Future Enhancements
- Voice input/output capabilities
- Multi-language support
- Advanced search and filtering
- Integration with student portal
- Analytics and usage tracking
- Custom training on ICAS-specific data

## Support
For technical support or questions about the Ask ICAS feature, please refer to the main project documentation or contact the development team.
