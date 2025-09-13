import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MessageSquare, 
  Bot, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  User,
  Activity,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AlumniProfile {
  name: string;
  linkedinUrl?: string;
  company?: string;
  title?: string;
  location?: string;
  status: 'pending' | 'searching' | 'found' | 'messaging' | 'linkedin_sent' | 'messaged' | 'replied' | 'error';
  message?: string;
  reply?: string;
  timestamp: string;
  phantomBusterId?: string;
  messageId?: string;
}

interface AutomationStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  description: string;
}

export default function AlumniAutomation() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [alumniName, setAlumniName] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [alumniProfiles, setAlumniProfiles] = useState<AlumniProfile[]>([]);
  const [currentStep, setCurrentStep] = useState<AutomationStep | null>(null);

  const automationSteps: AutomationStep[] = [
    {
      id: 'search',
      name: 'LinkedIn Profile Search',
      status: 'pending',
      description: 'Search for alumni profile and create contact record'
    },
    {
      id: 'ai_message',
      name: 'AI Message Generation',
      status: 'pending',
      description: 'Generate personalized message using OpenRouter'
    }
  ];

  const handleSearchAlumni = async () => {
    if (!alumniName.trim()) {
      toast.error('Please enter an alumni name');
      return;
    }

    setIsProcessing(true);
    const newProfile: AlumniProfile = {
      name: alumniName,
      status: 'searching',
      timestamp: new Date().toISOString()
    };

    setAlumniProfiles(prev => [...prev, newProfile]);
    setCurrentStep({ ...automationSteps[0], status: 'in_progress' });

    try {
      // Step 1: Search LinkedIn profile
      const searchResponse = await fetch('/api/alumni/search-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: alumniName })
      });

      if (!searchResponse.ok) throw new Error('LinkedIn search failed');
      
      const searchData = await searchResponse.json();
      
      // Update profile with LinkedIn data
      setAlumniProfiles(prev => prev.map(p => 
        p.name === alumniName 
          ? { ...p, ...searchData, status: 'found' }
          : p
      ));

      setCurrentStep({ ...automationSteps[0], status: 'completed' });
      setCurrentStep({ ...automationSteps[1], status: 'in_progress' });

      // Step 2: Generate AI message
      const messageResponse = await fetch('/api/alumni/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: alumniName, 
          profile: searchData,
          customMessage: customMessage || undefined
        })
      });

      if (!messageResponse.ok) throw new Error('Message generation failed');
      
      const messageData = await messageResponse.json();
      
      setAlumniProfiles(prev => prev.map(p => 
        p.name === alumniName 
          ? { ...p, message: messageData.message }
          : p
      ));

      setCurrentStep({ ...automationSteps[1], status: 'completed' });
      
      // Update profile with generated message
      setAlumniProfiles(prev => prev.map(p => 
        p.name === alumniName 
          ? { 
              ...p, 
              status: 'found',
              message: messageData.message
            }
          : p
      ));

      toast.success(`Successfully generated message for ${alumniName}!`);
      
    } catch (error) {
      console.error('Alumni automation error:', error);
      setAlumniProfiles(prev => prev.map(p => 
        p.name === alumniName 
          ? { ...p, status: 'error' }
          : p
      ));
      setCurrentStep(prev => prev ? { ...prev, status: 'error' } : null);
      toast.error(`Failed to process ${alumniName}: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentStep(null);
      setAlumniName('');
      setCustomMessage('');
    }
  };

  const getStatusIcon = (status: AlumniProfile['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'searching': return <Search className="w-4 h-4 text-blue-500" />;
      case 'found': return <User className="w-4 h-4 text-green-500" />;
      case 'messaging': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'linkedin_sent': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'messaged': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'replied': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: AlumniProfile['status']) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      searching: 'bg-blue-100 text-blue-800',
      found: 'bg-green-100 text-green-800',
      messaging: 'bg-blue-100 text-blue-800',
      linkedin_sent: 'bg-green-100 text-green-800',
      messaged: 'bg-green-100 text-green-800',
      replied: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <Card className={`border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader className={`bg-gradient-to-r ${isDark ? 'from-purple-900/20 to-pink-900/20' : 'from-purple-50 to-pink-50'} rounded-t-lg`}>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Alumni Automation</span>
                  <p className={`text-sm font-normal mt-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>LinkedIn profile search and AI message generation</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="alumni-name" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Alumni Name</Label>
                  <Input
                    id="alumni-name"
                    placeholder="Enter full name (e.g., John Smith)"
                    value={alumniName}
                    onChange={(e) => setAlumniName(e.target.value)}
                    disabled={isProcessing}
                    className={`${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'}`}
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="custom-message" className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Custom Message (Optional)</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Leave empty for AI-generated message"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    disabled={isProcessing}
                    rows={2}
                    className={`${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500' : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500'}`}
                  />
                </div>
              </div>
          
          <Button 
            onClick={handleSearchAlumni}
            disabled={isProcessing || !alumniName.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 py-3"
          >
            {isProcessing ? (
              <>
                <Search className="w-4 h-4 mr-2 animate-spin" />
                Processing Alumni...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Start Alumni Automation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

          {/* Current Step Progress */}
          {currentStep && (
            <Card className={`border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'}`}>
              <CardHeader className={`bg-gradient-to-r ${isDark ? 'from-blue-900/20 to-indigo-900/20' : 'from-blue-50 to-indigo-50'} rounded-t-lg`}>
                <CardTitle className={`text-lg flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                    <Activity className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  </div>
                  Current Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className={`flex items-center gap-4 p-4 rounded-xl border ${isDark ? 'bg-gradient-to-r from-gray-700 to-blue-900/20 border-gray-600' : 'bg-gradient-to-r from-slate-50 to-blue-50 border-slate-100'}`}>
                  {currentStep.status === 'in_progress' && (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {currentStep.status === 'completed' && (
                    <div className={`p-1 rounded-full ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                      <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    </div>
                  )}
                  {currentStep.status === 'error' && (
                    <div className={`p-1 rounded-full ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                      <AlertCircle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentStep.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{currentStep.description}</p>
                  </div>
                  <Badge variant="outline" className={
                    currentStep.status === 'in_progress' ? (isDark ? 'bg-blue-900/20 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200') :
                    currentStep.status === 'completed' ? (isDark ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200') :
                    (isDark ? 'bg-red-900/20 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-200')
                  }>
                    {currentStep.status === 'in_progress' ? 'In Progress' :
                     currentStep.status === 'completed' ? 'Completed' : 'Error'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Automation Steps Overview */}
          <Card className={`border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader className={`bg-gradient-to-r ${isDark ? 'from-green-900/20 to-emerald-900/20' : 'from-green-50 to-emerald-50'} rounded-t-lg`}>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                  <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                Automation Process
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {automationSteps.map((step, index) => (
                  <div key={step.id} className={`flex items-center gap-4 p-4 rounded-xl border hover:shadow-md transition-shadow ${isDark ? 'bg-gradient-to-r from-gray-700 to-green-900/20 border-gray-600' : 'bg-gradient-to-r from-slate-50 to-green-50 border-slate-100'}`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{step.name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{step.description}</p>
                    </div>
                    <Badge variant="outline" className={isDark ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200'}>
                      Ready
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alumni Profiles */}
          {alumniProfiles.length > 0 && (
            <Card className={`border shadow-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-sm'}`}>
              <CardHeader className={`bg-gradient-to-r ${isDark ? 'from-indigo-900/20 to-purple-900/20' : 'from-indigo-50 to-purple-50'} rounded-t-lg`}>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-1.5 rounded-lg ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100'}`}>
                    <Users className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                  </div>
                  Alumni Profiles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {alumniProfiles.map((profile, index) => (
                    <div key={index} className={`border rounded-xl p-6 space-y-4 hover:shadow-md transition-shadow ${isDark ? 'border-gray-600 bg-gradient-to-r from-gray-700 to-indigo-900/20' : 'border-slate-200 bg-gradient-to-r from-slate-50 to-indigo-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg shadow-sm ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
                            {getStatusIcon(profile.status)}
                          </div>
                          <div>
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile.name}</h3>
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                              {profile.company && profile.title 
                                ? `${profile.title} at ${profile.company}`
                                : 'Profile details loading...'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(profile.status)}
                        </div>
                      </div>

                      {profile.linkedinUrl && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                          <a 
                            href={profile.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View LinkedIn Profile
                          </a>
                        </div>
                      )}

                      {profile.message && (
                        <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Generated Message:</p>
                          <div className={`text-sm whitespace-pre-wrap max-h-40 overflow-y-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {profile.message}
                          </div>
                        </div>
                      )}

                      {profile.phantomBusterId && (
                        <div className={`p-3 rounded ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>HubSpot Campaign Details:</p>
                          <div className={`text-sm space-y-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                            <p><span className="font-medium">Message ID:</span> {profile.messageId}</p>
                            <p><span className="font-medium">Campaign ID:</span> {profile.phantomBusterId}</p>
                            <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Message queued via HubSpot automation</p>
                          </div>
                        </div>
                      )}

                      {profile.reply && (
                        <div className={`p-3 rounded ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-green-300' : 'text-green-800'}`}>Reply Received:</p>
                          <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>{profile.reply}</p>
                        </div>
                      )}

                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
                        Processed: {new Date(profile.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 