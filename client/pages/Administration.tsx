import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Video, 
  Image, 
  Settings, 
  Users, 
  BarChart3, 
  FileText,
  Calendar,
  Megaphone,
  Palette,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/theme/ThemeProvider';

const Administration: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const tools = [
    {
      id: 'photo-to-video',
      title: 'Photo to Video Converter',
      description: 'Convert uploaded images into slideshow videos with AI-powered audio narration',
      icon: <Video className="h-8 w-8" />,
      features: ['Image upload', 'Video processing', 'AI audio generation', 'Multiple formats'],
      route: '/administration/photo-to-video',
      status: 'active'
    },
    {
      id: 'marketing-tool',
      title: 'ICAS Marketing Tool',
      description: 'Create engaging social media content for events, advertisements, and announcements',
      icon: <Image className="h-8 w-8" />,
      features: ['Event posts', 'Advertisement creation', 'Multiple aspect ratios', 'AI generation'],
      route: '/administration/marketing-tool',
      status: 'active'
    },
    {
      id: 'smart-marketing',
      title: 'Smart Marketing',
      description: 'AI-powered social media post generation and image creation for ICAS campaigns',
      icon: <Sparkles className="h-8 w-8" />,
      features: ['AI post generation', 'Image creation', 'Multiple post types', 'Reference images'],
      route: '/administration/smart-marketing',
      status: 'active'
    },
    {
      id: 'content-management',
      title: 'Content Management',
      description: 'AI-powered content creation, optimization, and management with MCP server integration',
      icon: <FileText className="h-8 w-8" />,
      features: ['AI content generation', 'SEO optimization', 'Content ideas', 'MCP integration'],
      route: '/administration/content-management',
      status: 'active'
    },
    {
      id: 'social-media-analytics',
      title: 'Social Media Analytics',
      description: 'Monitor and analyze social media presence across platforms with detailed insights',
      icon: <TrendingUp className="h-8 w-8" />,
      features: ['Multi-platform tracking', 'Post analytics', 'Engagement metrics', 'Performance reports'],
      route: '/administration/social-media-analytics',
      status: 'active'
    },
    {
      id: 'outreach-management',
      title: 'Outreach Management',
      description: 'Research and connect with colleges, companies, events, and people for collaboration opportunities',
      icon: <MessageSquare className="h-8 w-8" />,
      features: ['Data gathering', 'MCP integration', 'AI email drafting', 'Collaboration tracking'],
      route: '/administration/outreach-management',
      status: 'active'
    },
    {
      id: 'user-management',
      title: 'User Management',
      description: 'Manage user accounts, roles, and permissions',
      icon: <Users className="h-8 w-8" />,
      features: ['User accounts', 'Role management', 'Access control', 'Activity logs'],
      route: '/administration/users',
      status: 'coming-soon'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'View website analytics, user engagement, and performance metrics',
      icon: <BarChart3 className="h-8 w-8" />,
      features: ['Traffic analysis', 'User behavior', 'Performance metrics', 'Custom reports'],
      route: '/administration/analytics',
      status: 'coming-soon'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system preferences, integrations, and maintenance',
      icon: <Settings className="h-8 w-8" />,
      features: ['System configuration', 'API integrations', 'Backup settings', 'Maintenance'],
      route: '/administration/settings',
      status: 'coming-soon'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'AI post generated',
      tool: 'Smart Marketing',
      user: 'Marketing Team',
      timestamp: '1 hour ago',
      status: 'completed'
    },
    {
      id: 2,
      action: 'Video generated',
      tool: 'Photo to Video',
      user: 'Admin User',
      timestamp: '2 hours ago',
      status: 'completed'
    },
    {
      id: 3,
      action: 'Marketing content created',
      tool: 'Marketing Tool',
      user: 'Marketing Team',
      timestamp: '4 hours ago',
      status: 'completed'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className={`${isDark ? 'bg-emerald-900/20 text-emerald-300 border-emerald-700' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>Active</Badge>;
      case 'coming-soon':
        return <Badge className={`${isDark ? 'bg-amber-900/20 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>Coming Soon</Badge>;
      case 'completed':
        return <Badge className={`${isDark ? 'bg-blue-900/20 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Administration Dashboard
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Manage your website content, tools, and system settings from one central location
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${isDark ? 'bg-green-900/20 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200'}`}>
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                All Systems Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Total Tools</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+2 this month</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Active Tools</p>
                  <p className="text-2xl font-bold text-emerald-600">5</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>All operational</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100'}`}>
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Recent Activity</p>
                  <p className="text-2xl font-bold text-indigo-600">23</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+12% this week</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100'}`}>
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>99.9% uptime</p>
                </div>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                  <div className="h-4 w-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tools Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Administration Tools</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                          <div className="text-blue-600">
                            {tool.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <CardTitle className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{tool.title}</CardTitle>
                          <div className="mt-2">
                            {getStatusBadge(tool.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{tool.description}</CardDescription>
                    
                    <div className="space-y-2 mb-6">
                      {tool.features.map((feature, index) => (
                        <div key={index} className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="h-1.5 w-1.5 bg-blue-400 rounded-full"></div>
                          {feature}
                        </div>
                      ))}
                    </div>

                    {tool.status === 'active' ? (
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        <Link to={tool.route} className="flex items-center justify-center gap-2">
                          Access Tool
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className={`w-full ${isDark ? 'bg-gray-700 text-gray-400 border-gray-600' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                        Coming Soon
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100'}`}>
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                  </div>
                  Recent Activity
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>Latest actions from administration tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`p-1.5 rounded-full mt-1 ${isDark ? 'bg-indigo-900/20' : 'bg-indigo-100'}`}>
                        <div className="h-2 w-2 bg-indigo-500 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activity.tool} • {activity.user} • {activity.timestamp}
                        </p>
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100'}`}>
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription className={isDark ? 'text-gray-300' : 'text-gray-600'}>Common administration tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className={`w-full justify-start ${isDark ? 'border-gray-600 hover:bg-gray-700' : ''}`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Content
                </Button>
                <Button variant="outline" className={`w-full justify-start ${isDark ? 'border-gray-600 hover:bg-gray-700' : ''}`}>
                  <Megaphone className="h-4 w-4 mr-2" />
                  Send Announcement
                </Button>
                <Button variant="outline" className={`w-full justify-start ${isDark ? 'border-gray-600 hover:bg-gray-700' : ''}`}>
                  <Palette className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
                <Button variant="outline" className={`w-full justify-start ${isDark ? 'border-gray-600 hover:bg-gray-700' : ''}`}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Smart Marketing
                </Button>
                <Button variant="outline" className={`w-full justify-start ${isDark ? 'border-gray-600 hover:bg-gray-700' : ''}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>

            {/* System Info */}
            <Card className={`border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <Settings className={`h-5 w-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
                  </div>
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Version:</span>
                  <Badge variant="outline" className={isDark ? 'bg-blue-900/20 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700'}>1.0.0</Badge>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Last Updated:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Today</span>
                </div>
                <div className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className={`font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>All Systems Operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Administration; 