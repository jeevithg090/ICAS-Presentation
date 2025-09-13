import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Search, 
  FileText, 
  Image, 
  Video, 
  Share2, 
  Calendar, 
  Users, 
  TrendingUp,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Edit3,
  Copy,
  Download,
  Plus,
  Filter,
  BarChart3,
  Lightbulb,
  Target,
  Zap,
  BookOpen,
  MessageSquare,
  Camera,
  FileImage,
  Presentation,
  File
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { toast } from '../ui/use-toast';
import { contentMCPService, ContentItem } from '../../lib/content-mcp-service';

interface ContentGenerationRequest {
  type: 'blog' | 'social' | 'video' | 'image' | 'document' | 'presentation';
  topic: string;
  requirements: string;
  targetAudience: string;
  tone: 'professional' | 'casual' | 'academic' | 'marketing';
  length: 'short' | 'medium' | 'long';
}

interface ContentOptimizationRequest {
  content: string;
  type: string;
  targetAudience: string;
  goals: string[];
}

interface ContentIdea {
  id: string;
  title: string;
  description: string;
  url?: string;
  source: string;
  category: string;
  relevance: number;
  data: any;
  timestamp: string;
}

const ContentManagement: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [currentRequest, setCurrentRequest] = useState<ContentGenerationRequest>({
    type: 'blog',
    topic: '',
    requirements: '',
    targetAudience: '',
    tone: 'professional',
    length: 'medium'
  });
  const [optimizationRequest, setOptimizationRequest] = useState<ContentOptimizationRequest>({
    content: '',
    type: '',
    targetAudience: '',
    goals: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [optimizedContent, setOptimizedContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('generate');

  const contentTypes = [
    { value: 'blog', label: 'Blog Post', icon: <FileText className="h-4 w-4" /> },
    { value: 'social', label: 'Social Media', icon: <Share2 className="h-4 w-4" /> },
    { value: 'video', label: 'Video Script', icon: <Video className="h-4 w-4" /> },
    { value: 'image', label: 'Image Content', icon: <Image className="h-4 w-4" /> },
    { value: 'document', label: 'Document', icon: <File className="h-4 w-4" /> },
    { value: 'presentation', label: 'Presentation', icon: <Presentation className="h-4 w-4" /> }
  ];

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'casual', label: 'Casual' },
    { value: 'academic', label: 'Academic' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (200-400 words)' },
    { value: 'medium', label: 'Medium (500-800 words)' },
    { value: 'long', label: 'Long (1000+ words)' }
  ];

  const handleGenerateContent = async () => {
    if (!currentRequest.topic || !currentRequest.requirements || !currentRequest.targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please provide topic, requirements, and target audience.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setActiveTab('results');

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentRequest)
      });

      if (!response.ok) {
        throw new Error('Content generation failed');
      }

      const data = await response.json();
      const generatedContent = data.content || [];

      // Convert to ContentItem format
      const contentItems: ContentItem[] = generatedContent.map((item: any, index: number) => ({
        id: `generated-${Date.now()}-${index}`,
        title: item.title || `Generated Content ${index + 1}`,
        type: currentRequest.type,
        content: item.content || '',
        status: 'draft',
        category: 'generated',
        tags: extractTags(currentRequest.topic, currentRequest.requirements),
        author: 'AI Content Generator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        seoData: {
          title: item.title || `Generated Content ${index + 1}`,
          description: (item.content || '').substring(0, 160) + '...',
          keywords: extractTags(currentRequest.topic, currentRequest.requirements),
          metaTags: ['content management', 'ICAS Manipal', 'AI generated']
        },
        mcpSource: 'content-generator'
      }));

      setContentItems(prev => [...contentItems, ...prev]);
      setSelectedContent(contentItems[0]);

      toast({
        title: "Content Generated",
        description: `Successfully generated ${contentItems.length} content pieces.`,
      });
    } catch (error) {
      console.error('Content generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeContent = async () => {
    if (!optimizationRequest.content || !optimizationRequest.type || !optimizationRequest.targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please provide content, type, and target audience.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);

    try {
      const response = await fetch('/api/content/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizationRequest)
      });

      if (!response.ok) {
        throw new Error('Content optimization failed');
      }

      const data = await response.json();
      setOptimizedContent(data);

      toast({
        title: "Content Optimized",
        description: `SEO Score: ${data.seoScore}/100. Check the optimization results.`,
      });
    } catch (error) {
      console.error('Content optimization error:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSearchIdeas = async () => {
    if (!currentRequest.topic) {
      toast({
        title: "Missing Topic",
        description: "Please provide a topic to search for content ideas.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setActiveTab('ideas');

    try {
      const response = await fetch('/api/content/search-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: currentRequest.topic,
          category: currentRequest.type,
          targetAudience: currentRequest.targetAudience
        })
      });

      if (!response.ok) {
        throw new Error('Content ideas search failed');
      }

      const data = await response.json();
      setContentIdeas(data.ideas || []);

      toast({
        title: "Ideas Found",
        description: `Found ${data.ideas?.length || 0} content ideas for ${currentRequest.topic}.`,
      });
    } catch (error) {
      console.error('Content ideas search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search for content ideas. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const handleDownloadContent = (content: ContentItem) => {
    const blob = new Blob([content.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Content downloaded successfully.",
    });
  };

  const extractTags = (topic: string, requirements: string): string[] => {
    const words = `${topic} ${requirements}`.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => word.length > 2 && !commonWords.includes(word)).slice(0, 5);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'social': return <Share2 className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'document': return <File className="h-4 w-4" />;
      case 'presentation': return <Presentation className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-600 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Content Management
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                AI-powered content creation, optimization, and management for ICAS Manipal
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <TabsTrigger value="generate">Generate Content</TabsTrigger>
            <TabsTrigger value="optimize">Optimize Content</TabsTrigger>
            <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
            <TabsTrigger value="results">Generated Content</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Content Generation Form */}
              <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="h-5 w-5 text-purple-600" />
                    Generate New Content
                  </CardTitle>
                  <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Create AI-powered content for various platforms and purposes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Content Type */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Content Type</Label>
                    <Select 
                      value={currentRequest.type} 
                      onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Topic</Label>
                    <Input
                      placeholder="Enter content topic"
                      value={currentRequest.topic}
                      onChange={(e) => setCurrentRequest(prev => ({ ...prev, topic: e.target.value }))}
                      className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}
                    />
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Requirements</Label>
                    <Textarea
                      placeholder="Describe what the content should include"
                      value={currentRequest.requirements}
                      onChange={(e) => setCurrentRequest(prev => ({ ...prev, requirements: e.target.value }))}
                      className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}
                      rows={3}
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Target Audience</Label>
                    <Input
                      placeholder="Who is the target audience?"
                      value={currentRequest.targetAudience}
                      onChange={(e) => setCurrentRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                      className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}
                    />
                  </div>

                  {/* Tone and Length */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Tone</Label>
                      <Select 
                        value={currentRequest.tone} 
                        onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, tone: value as any }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              {tone.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Length</Label>
                      <Select 
                        value={currentRequest.length} 
                        onValueChange={(value) => setCurrentRequest(prev => ({ ...prev, length: value as any }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {lengths.map((length) => (
                            <SelectItem key={length.value} value={length.value}>
                              {length.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Content */}
              <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardHeader>
                  <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Recent Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentItems.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedContent?.id === item.id
                            ? isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                            : isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedContent(item)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.title}
                            </span>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Target className="h-5 w-5 text-blue-600" />
                  Optimize Content
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Improve existing content for better SEO and engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Input */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Content Type</Label>
                      <Select 
                        value={optimizationRequest.type} 
                        onValueChange={(value) => setOptimizationRequest(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                {type.icon}
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Target Audience</Label>
                      <Input
                        placeholder="Who is the target audience?"
                        value={optimizationRequest.targetAudience}
                        onChange={(e) => setOptimizationRequest(prev => ({ ...prev, targetAudience: e.target.value }))}
                        className={isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Content to Optimize</Label>
                      <Textarea
                        placeholder="Paste your content here..."
                        value={optimizationRequest.content}
                        onChange={(e) => setOptimizationRequest(prev => ({ ...prev, content: e.target.value }))}
                        className={`min-h-[200px] ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white'}`}
                      />
                    </div>

                    <Button 
                      onClick={handleOptimizeContent}
                      disabled={isOptimizing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isOptimizing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Optimize Content
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Results */}
                  <div className="space-y-4">
                    {optimizedContent && (
                      <>
                        <div className="flex items-center justify-between">
                          <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Optimized Content</Label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              SEO Score: {optimizedContent.seoScore}/100
                            </Badge>
                            <Button
                              onClick={() => handleCopyContent(optimizedContent.optimizedContent)}
                              variant="outline"
                              size="sm"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                            {optimizedContent.optimizedContent.split('\n').map((line: string, index: number) => {
                              // Clean up the line first
                              let cleanLine = line.trim();
                              
                              // Skip empty lines and separator lines
                              if (cleanLine === '' || cleanLine === '---' || cleanLine === '**') {
                                return <br key={index} />;
                              }
                              
                              // Handle different text formatting
                              if (cleanLine.startsWith('# ')) {
                                return (
                                  <h1 key={index} className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(2).trim()}
                                  </h1>
                                );
                              } else if (cleanLine.startsWith('## ')) {
                                return (
                                  <h2 key={index} className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(3).trim()}
                                  </h2>
                                );
                              } else if (cleanLine.startsWith('### ')) {
                                return (
                                  <h3 key={index} className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(4).trim()}
                                  </h3>
                                );
                              } else if (cleanLine.startsWith('**') && cleanLine.endsWith('**') && cleanLine.length > 4) {
                                return (
                                  <p key={index} className="mb-2">
                                    <strong className="font-semibold">{cleanLine.substring(2, cleanLine.length - 2).trim()}</strong>
                                  </p>
                                );
                              } else if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                                const content = cleanLine.substring(2).trim();
                                // Handle nested formatting in bullet points
                                const formattedContent = content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                  </div>
                                );
                              } else if (cleanLine.startsWith('✅')) {
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="mr-2 text-green-500">✅</span>
                                    <span>{cleanLine.substring(1).trim()}</span>
                                  </div>
                                );
                              } else {
                                // Handle inline formatting for regular text
                                const formattedContent = cleanLine
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                
                                return (
                                  <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              }
                            })}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Suggestions</Label>
                          <div className="space-y-2">
                            {optimizedContent.suggestions?.map((suggestion: string, index: number) => {
                              // Clean up the suggestion text
                              let cleanSuggestion = suggestion.trim();
                              
                              // Skip empty suggestions or separator lines
                              if (cleanSuggestion === '' || cleanSuggestion === '---' || cleanSuggestion === '•' || cleanSuggestion === '<em></em>') {
                                return null;
                              }
                              
                              // Remove bullet points if they exist
                              if (cleanSuggestion.startsWith('•')) {
                                cleanSuggestion = cleanSuggestion.substring(1).trim();
                              }
                              
                              // Format the content
                              const formattedContent = cleanSuggestion
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/<strong>(.*?)<\/strong>/g, '<strong>$1</strong>')
                                .replace(/<em>(.*?)<\/em>/g, '<em>$1</em>');
                              
                              return (
                                <div key={index} className="flex items-start">
                                  <span className="mr-2 text-blue-500 font-bold">•</span>
                                  <span 
                                    className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}
                                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                                  />
                                </div>
                              );
                            }).filter(Boolean)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>Keywords</Label>
                          <div className="flex flex-wrap gap-2">
                            {optimizedContent.keywords?.map((keyword: string, index: number) => {
                              // Clean up the keyword
                              let cleanKeyword = keyword.trim();
                              
                              // Remove any HTML tags or markdown formatting
                              cleanKeyword = cleanKeyword
                                .replace(/<[^>]*>/g, '') // Remove HTML tags
                                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
                                .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown
                                .trim();
                              
                              // Skip empty keywords
                              if (!cleanKeyword) return null;
                              
                              return (
                                <Badge key={index} variant="outline" className={`text-xs ${isDark ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                                  {cleanKeyword}
                                </Badge>
                              );
                            }).filter(Boolean)}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-6">
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Content Ideas
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                  Generate creative content ideas for your topic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generate Ideas Button */}
                <div className="text-center">
                  <Button 
                    onClick={handleSearchIdeas}
                    disabled={isSearching || !currentRequest.topic}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Ideas...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Generate Content Ideas
                      </>
                    )}
                  </Button>
                  {!currentRequest.topic && (
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Enter a topic in the Generate Content tab first
                    </p>
                  )}
                </div>

                {/* Ideas Display */}
                {contentIdeas.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Generated Ideas ({contentIdeas.length})
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {contentIdeas[0]?.source || 'AI Generated'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contentIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {idea.title}
                              </h4>
                              <div className="flex items-center gap-1 ml-2">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">{idea.relevance}%</span>
                              </div>
                            </div>
                            
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                              {idea.description}
                            </p>
                            
                            {idea.url && (
                              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                <ExternalLink className="h-3 w-3 text-blue-500" />
                                <a
                                  href={idea.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  View Source
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {contentIdeas.length === 0 && !isSearching && (
                  <div className="text-center py-12">
                    <Lightbulb className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      No Ideas Generated Yet
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Click the button above to generate creative content ideas for your topic
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {selectedContent ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Content List */}
                <div className="lg:col-span-1">
                  <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <CardHeader>
                      <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Generated Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {contentItems.map((item) => (
                          <div
                            key={item.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedContent?.id === item.id
                                ? isDark ? 'bg-purple-900/20 border-purple-700' : 'bg-purple-50 border-purple-200'
                                : isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedContent(item)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(item.type)}
                                <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </span>
                              </div>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Content Details */}
                <div className="lg:col-span-2">
                  <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {getTypeIcon(selectedContent.type)}
                            {selectedContent.title}
                          </CardTitle>
                          <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {selectedContent.type} • {selectedContent.wordCount || selectedContent.content.split(' ').length} words
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleCopyContent(selectedContent.content)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                          <Button
                            onClick={() => handleDownloadContent(selectedContent)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                            {selectedContent.content.split('\n').map((line: string, index: number) => {
                              // Clean up the line first
                              let cleanLine = line.trim();
                              
                              // Skip empty lines and separator lines
                              if (cleanLine === '' || cleanLine === '---' || cleanLine === '**') {
                                return <br key={index} />;
                              }
                              
                              // Handle different text formatting
                              if (cleanLine.startsWith('# ')) {
                                return (
                                  <h1 key={index} className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(2).trim()}
                                  </h1>
                                );
                              } else if (cleanLine.startsWith('## ')) {
                                return (
                                  <h2 key={index} className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(3).trim()}
                                  </h2>
                                );
                              } else if (cleanLine.startsWith('### ')) {
                                return (
                                  <h3 key={index} className={`text-base font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {cleanLine.substring(4).trim()}
                                  </h3>
                                );
                              } else if (cleanLine.startsWith('**') && cleanLine.endsWith('**') && cleanLine.length > 4) {
                                return (
                                  <p key={index} className="mb-2">
                                    <strong className="font-semibold">{cleanLine.substring(2, cleanLine.length - 2).trim()}</strong>
                                  </p>
                                );
                              } else if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
                                const content = cleanLine.substring(2).trim();
                                // Handle nested formatting in bullet points
                                const formattedContent = content
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="mr-2 text-blue-500">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                  </div>
                                );
                              } else if (cleanLine.startsWith('✅')) {
                                return (
                                  <div key={index} className="flex items-start mb-1">
                                    <span className="mr-2 text-green-500">✅</span>
                                    <span>{cleanLine.substring(1).trim()}</span>
                                  </div>
                                );
                              } else {
                                // Handle inline formatting for regular text
                                const formattedContent = cleanLine
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>');
                                
                                return (
                                  <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              }
                            })}
                          </div>
                        </div>

                        {selectedContent.seoData && (
                          <div className="space-y-3">
                            <Label className={isDark ? 'text-gray-300' : 'text-gray-700'}>SEO Information</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Title</Label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {selectedContent.seoData.title}
                                </p>
                              </div>
                              <div>
                                <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Description</Label>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {selectedContent.seoData.description}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Keywords</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedContent.seoData.keywords?.map((keyword: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      No Content Selected
                    </h3>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Generate some content or select an existing piece to view details
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentManagement;
