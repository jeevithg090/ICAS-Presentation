import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  BookOpen,
  GraduationCap,
  Globe,
  Users,
  Building,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  question: string;
  icon: React.ReactNode;
  category: string;
}

const AskICAS: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm the ICAS Manipal AI Assistant. I can help you with information about our programs, admission process, campus facilities, student life, and much more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      id: 'programs',
      label: 'Programs & Specializations',
      question: 'What engineering programs and specializations are available at ICAS Manipal?',
      icon: <GraduationCap className="h-4 w-4" />,
      category: 'Academics'
    },
    {
      id: 'admission',
      label: 'Admission Process',
      question: 'How do I apply for admission to ICAS Manipal? What are the requirements?',
      icon: <BookOpen className="h-4 w-4" />,
      category: 'Admission'
    },
    {
      id: 'transfer',
      label: 'International Transfer',
      question: 'How does the international transfer program work? Which universities can I transfer to?',
      icon: <Globe className="h-4 w-4" />,
      category: 'Transfer'
    },
    {
      id: 'campus',
      label: 'Campus Facilities',
      question: 'What facilities and infrastructure are available on campus?',
      icon: <Building className="h-4 w-4" />,
      category: 'Campus'
    },
    {
      id: 'student-life',
      label: 'Student Life',
      question: 'What is student life like at ICAS Manipal? What clubs and activities are available?',
      icon: <Users className="h-4 w-4" />,
      category: 'Student Life'
    },
    {
      id: 'fees',
      label: 'Fees & Scholarships',
      question: 'What are the fee structures and scholarship opportunities available?',
      icon: <DollarSign className="h-4 w-4" />,
      category: 'Financial'
    },
    {
      id: 'events',
      label: 'Events & Activities',
      question: 'What events, activities, and programs are organized throughout the year?',
      icon: <Calendar className="h-4 w-4" />,
      category: 'Events'
    },
    {
      id: 'contact',
      label: 'Contact Information',
      question: 'How can I contact ICAS Manipal for more information or support?',
      icon: <Phone className="h-4 w-4" />,
      category: 'Contact'
    }
  ];

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    // Only auto-scroll if there are more than 2 messages (initial message + user message)
    // This prevents excessive scrolling on initial load
    if (messages.length > 2) {
      // Use setTimeout to ensure the DOM has updated before scrolling
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-icas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          context: 'User is asking about ICAS Manipal',
          conversationHistory: messages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'I apologize, but I encountered an issue generating a response. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Ask ICAS
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Your AI Assistant for ICAS Manipal Information
              </p>
            </div>
            <div className="ml-auto">
              <Badge className={`${isDark ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <CardTitle className={`flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Chat with ICAS Assistant
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={scrollToBottom}
                    className={`h-8 w-8 p-0 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    title="Scroll to bottom"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea ref={scrollAreaRef} className="h-[500px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role === 'assistant' && (
                          <div className={`p-2 rounded-full ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? `${isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'}`
                              : `${isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.role === 'user' 
                              ? 'text-blue-100' 
                              : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className={`p-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                          <Bot className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className={`max-w-[80%] rounded-lg p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              Thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input Form */}
                <div className={`border-t p-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything about ICAS Manipal..."
                      className={`flex-1 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      disabled={isLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className={`w-full justify-start h-auto p-3 ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {action.label}
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {action.category}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    What can I help you with?
                  </p>
                  <ul className={`mt-2 space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>• Program information</li>
                    <li>• Admission requirements</li>
                    <li>• Campus facilities</li>
                    <li>• Student life</li>
                    <li>• International transfers</li>
                    <li>• Fees and scholarships</li>
                  </ul>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    💡 Tip
                  </p>
                  <p className={`mt-1 ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    Ask specific questions for more detailed answers!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskICAS;
