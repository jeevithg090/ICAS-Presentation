import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Globe, 
  Newspaper, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  ExternalLink,
  BookOpen,
  TrendingUp,
  MapPin,
  Calendar,
  Users,
  Star,
  Settings
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { mcpService } from '../lib/mcp-service';
import { MCPUniversity, MCPNewsArticle, MCPServer } from '../lib/mcp-service';

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string;
  description: string;
  ranking?: number;
  programs: string[];
  lastUpdated: string;
  status: 'active' | 'inactive';
}

interface NewsArticle {
  id: string;
  title: string;
  university: string;
  summary: string;
  url: string;
  publishedDate: string;
  category: string;
  source: 'university' | 'external' | 'mcp';
}

const ContentManagement: React.FC = () => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [showAddUniversity, setShowAddUniversity] = useState(false);
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    country: '',
    city: '',
    website: '',
    description: '',
    programs: ''
  });

  // Sample data - in real implementation, this would come from MCP servers
  const sampleUniversities: University[] = [
    {
      id: '1',
      name: 'University of Oxford',
      country: 'United Kingdom',
      city: 'Oxford',
      website: 'https://www.ox.ac.uk',
      description: 'One of the world\'s leading universities, known for its research excellence and academic rigor.',
      ranking: 1,
      programs: ['Arts', 'Humanities', 'Social Sciences', 'Medicine', 'Engineering'],
      lastUpdated: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Harvard University',
      country: 'United States',
      city: 'Cambridge',
      website: 'https://www.harvard.edu',
      description: 'America\'s oldest institution of higher learning, consistently ranked among the world\'s top universities.',
      ranking: 2,
      programs: ['Business', 'Law', 'Medicine', 'Arts & Sciences', 'Engineering'],
      lastUpdated: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'University of Tokyo',
      country: 'Japan',
      city: 'Tokyo',
      website: 'https://www.u-tokyo.ac.jp',
      description: 'Japan\'s premier university, leading in research and innovation across various disciplines.',
      ranking: 23,
      programs: ['Science', 'Engineering', 'Medicine', 'Arts', 'Economics'],
      lastUpdated: '2024-01-13',
      status: 'active'
    }
  ];

  const sampleNews: NewsArticle[] = [
    {
      id: '1',
      title: 'Oxford Launches New AI Research Initiative',
      university: 'University of Oxford',
      summary: 'The university announces a groundbreaking AI research program with industry partnerships.',
      url: 'https://www.ox.ac.uk/news/ai-research',
      publishedDate: '2024-01-15',
      category: 'Research',
      source: 'university'
    },
    {
      id: '2',
      title: 'Harvard Business School Expands Online Programs',
      university: 'Harvard University',
      summary: 'HBS introduces new online learning opportunities for global students.',
      url: 'https://www.hbs.edu/news/online-programs',
      publishedDate: '2024-01-14',
      category: 'Education',
      source: 'university'
    }
  ];

  useEffect(() => {
    setUniversities(sampleUniversities);
    setNewsArticles(sampleNews);
    loadMCPServers();
  }, []);

  const loadMCPServers = async () => {
    try {
      const servers = await mcpService.getServers();
      setMcpServers(servers);
    } catch (error) {
      console.error('Failed to load MCP servers:', error);
    }
  };

  const countries = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Singapore', 'Netherlands', 'Switzerland'];

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uni.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || uni.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const handleAddUniversity = () => {
    if (!newUniversity.name || !newUniversity.country || !newUniversity.city) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const university: University = {
      id: Date.now().toString(),
      name: newUniversity.name,
      country: newUniversity.country,
      city: newUniversity.city,
      website: newUniversity.website,
      description: newUniversity.description,
      programs: newUniversity.programs.split(',').map(p => p.trim()).filter(p => p),
      lastUpdated: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    setUniversities([...universities, university]);
    setNewUniversity({ name: '', country: '', city: '', website: '', description: '', programs: '' });
    setShowAddUniversity(false);
    
    toast({
      title: "Success",
      description: "University added successfully",
    });
  };

  const fetchNewsFromMCP = async () => {
    setLoading(true);
    try {
      const mcpNews = await mcpService.fetchNews({ limit: 5 });
      const formattedNews: NewsArticle[] = mcpNews.map(article => ({
        id: article.id,
        title: article.title,
        university: article.university,
        summary: article.summary,
        url: article.url,
        publishedDate: article.publishedDate.split('T')[0],
        category: article.category,
        source: 'mcp' as const
      }));
      setNewsArticles([...formattedNews, ...newsArticles]);
      toast({
        title: "Success",
        description: `Fetched ${formattedNews.length} news articles from MCP servers`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch news from MCP servers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUniversity = (id: string) => {
    setUniversities(universities.filter(uni => uni.id !== id));
    toast({
      title: "Success",
      description: "University removed successfully",
    });
  };

  const testMCPServer = async () => {
    try {
      const result = await mcpService.testConnection('university-db');
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test MCP server connection",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                Content Management
              </h1>
              <p className="text-lg text-slate-600">
                Manage abroad universities, their information, and news updates using MCP server integration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Globe className="h-3 w-3 mr-1" />
                MCP Connected
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="universities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm border-0 shadow-sm">
            <TabsTrigger value="universities" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <Globe className="h-4 w-4" />
              Universities
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Newspaper className="h-4 w-4" />
              News & Updates
            </TabsTrigger>
            <TabsTrigger value="mcp" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
              <Search className="h-4 w-4" />
              MCP Integration
            </TabsTrigger>
          </TabsList>

          {/* Universities Tab */}
          <TabsContent value="universities" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <Input
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowAddUniversity(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add University
              </Button>
            </div>

            {/* Universities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((university) => (
                <Card key={university.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white hover:scale-[1.02]">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{university.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600">{university.city}, {university.country}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => {}} className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteUniversity(university.id)} className="hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">{university.description}</p>
                    
                    {university.ranking && (
                      <div className="flex items-center gap-2 mb-4 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">World Ranking: #{university.ranking}</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Programs:</p>
                      <div className="flex flex-wrap gap-1">
                        {university.programs.slice(0, 3).map((program, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                            {program}
                          </Badge>
                        ))}
                        {university.programs.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{university.programs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                      <span>Updated: {university.lastUpdated}</span>
                      <Button variant="outline" size="sm" asChild className="hover:bg-green-50 hover:border-green-200 hover:text-green-700">
                        <a href={university.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Latest News & Updates</h3>
              <Button onClick={fetchNewsFromMCP} disabled={loading} className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Fetching...' : 'Fetch from MCP'}
              </Button>
            </div>

            <div className="space-y-4">
              {newsArticles.map((article) => (
                <Card key={article.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{article.title}</h4>
                          <Badge variant={article.source === 'mcp' ? 'default' : 'secondary'}>
                            {article.source.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {article.university}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {article.publishedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* MCP Integration Tab */}
          <TabsContent value="mcp" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  MCP Server Integration
                </CardTitle>
                <CardDescription>
                  Connect to MCP servers to fetch real-time university information and news
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="p-4 border rounded-lg">
                     <h4 className="font-medium mb-2">Available MCP Servers</h4>
                     <ul className="space-y-2 text-sm text-gray-600">
                       {mcpServers.map((server) => (
                         <li key={server.id} className="flex items-center gap-2">
                           <div className={`h-2 w-2 rounded-full ${
                             server.status === 'connected' ? 'bg-green-500' :
                             server.status === 'connecting' ? 'bg-yellow-500' :
                             server.status === 'disconnected' ? 'bg-gray-400' : 'bg-red-500'
                           }`}></div>
                           {server.name}
                           <Badge variant="outline" className="text-xs ml-auto">
                             {server.status}
                           </Badge>
                         </li>
                       ))}
                     </ul>
                   </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">MCP Features</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Real-time university data</li>
                      <li>• News aggregation</li>
                      <li>• Academic rankings</li>
                      <li>• Research updates</li>
                      <li>• Program information</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={fetchNewsFromMCP} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Test MCP Connection
                  </Button>
                  <Button variant="outline" onClick={testMCPServer}>
                    <Settings className="h-4 w-4 mr-2" />
                    Test Server
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add University Modal */}
        {showAddUniversity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New University</CardTitle>
                <CardDescription>Enter university information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">University Name *</label>
                  <Input
                    value={newUniversity.name}
                    onChange={(e) => setNewUniversity({...newUniversity, name: e.target.value})}
                    placeholder="Enter university name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Country *</label>
                    <Select value={newUniversity.country} onValueChange={(value) => setNewUniversity({...newUniversity, country: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">City *</label>
                    <Input
                      value={newUniversity.city}
                      onChange={(e) => setNewUniversity({...newUniversity, city: e.target.value})}
                      placeholder="Enter city"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={newUniversity.website}
                    onChange={(e) => setNewUniversity({...newUniversity, website: e.target.value})}
                    placeholder="https://www.university.edu"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newUniversity.description}
                    onChange={(e) => setNewUniversity({...newUniversity, description: e.target.value})}
                    placeholder="Enter university description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Programs (comma-separated)</label>
                  <Input
                    value={newUniversity.programs}
                    onChange={(e) => setNewUniversity({...newUniversity, programs: e.target.value})}
                    placeholder="Arts, Sciences, Engineering"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddUniversity} className="flex-1">
                    Add University
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddUniversity(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement; 