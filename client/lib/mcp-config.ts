// MCP Configuration for University Content Management
// This file defines the available MCP servers and their integration settings

export interface MCPEndpoint {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  protocol: 'mcp' | 'http' | 'websocket';
  authentication?: {
    type: 'api_key' | 'oauth' | 'none';
    key?: string;
    secret?: string;
  };
  capabilities: string[];
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
  status: 'available' | 'maintenance' | 'deprecated';
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    description: string;
    default?: any;
  }[];
  returns: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
  };
}

// Available MCP Servers for University Data
export const MCP_SERVERS: MCPEndpoint[] = [
  {
    id: 'university-database',
    name: 'University Database MCP',
    description: 'Comprehensive database of universities worldwide with rankings, programs, and detailed information',
    endpoint: 'https://api.university-database.com/mcp',
    protocol: 'http',
    capabilities: [
      'university_search',
      'university_details',
      'program_listing',
      'ranking_data',
      'location_information',
      'contact_details',
      'admission_requirements'
    ],
    rateLimit: {
      requests: 100,
      window: 60
    },
    status: 'available'
  },
  {
    id: 'news-aggregator',
    name: 'News Aggregator MCP',
    description: 'Real-time news aggregation from university websites, academic journals, and research institutions',
    endpoint: 'https://news-aggregator-mcp.glitch.me',
    protocol: 'http',
    capabilities: [
      'news_fetch',
      'content_parsing',
      'source_validation',
      'category_classification',
      'sentiment_analysis',
      'trend_detection',
      'multilingual_support'
    ],
    rateLimit: {
      requests: 50,
      window: 60
    },
    status: 'available'
  },
  {
    id: 'academic-rankings',
    name: 'Academic Rankings MCP',
    description: 'Latest academic rankings, performance metrics, and comparison data from various ranking systems',
    endpoint: 'https://academic-rankings-mcp.herokuapp.com',
    protocol: 'http',
    capabilities: [
      'ranking_updates',
      'performance_metrics',
      'comparison_data',
      'historical_trends',
      'subject_rankings',
      'regional_rankings',
      'ranking_methodology'
    ],
    rateLimit: {
      requests: 200,
      window: 60
    },
    status: 'available'
  },
  {
    id: 'research-papers',
    name: 'Research Papers MCP',
    description: 'Access to academic research papers, publications, and citation data from various databases',
    endpoint: 'https://research-papers-mcp.netlify.app',
    protocol: 'http',
    capabilities: [
      'paper_search',
      'citation_data',
      'author_information',
      'research_trends',
      'collaboration_networks',
      'impact_metrics',
      'full_text_access'
    ],
    rateLimit: {
      requests: 30,
      window: 60
    },
    status: 'maintenance'
  },
  {
    id: 'student-exchange',
    name: 'Student Exchange MCP',
    description: 'Information about student exchange programs, partnerships, and international opportunities',
    endpoint: 'https://student-exchange-mcp.vercel.app',
    protocol: 'http',
    capabilities: [
      'exchange_programs',
      'partnership_agreements',
      'scholarship_opportunities',
      'visa_information',
      'cultural_guidance',
      'application_process'
    ],
    rateLimit: {
      requests: 75,
      window: 60
    },
    status: 'available'
  },
  {
    id: 'faculty-directory',
    name: 'Faculty Directory MCP',
    description: 'Comprehensive faculty information, research interests, and contact details',
    endpoint: 'https://faculty-directory-mcp.railway.app',
    protocol: 'http',
    capabilities: [
      'faculty_search',
      'research_interests',
      'publication_history',
      'contact_information',
      'expertise_areas',
      'collaboration_opportunities'
    ],
    rateLimit: {
      requests: 150,
      window: 60
    },
    status: 'available'
  }
];

// Available MCP Tools
export const MCP_TOOLS: MCPTool[] = [
  {
    id: 'search_universities',
    name: 'Search Universities',
    description: 'Search for universities based on various criteria',
    endpoint: 'university-database',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query for university name or keywords'
      },
      {
        name: 'country',
        type: 'string',
        required: false,
        description: 'Filter by country'
      },
      {
        name: 'programs',
        type: 'array',
        required: false,
        description: 'Filter by available programs'
      },
      {
        name: 'ranking',
        type: 'number',
        required: false,
        description: 'Filter by minimum world ranking'
      }
    ],
    returns: {
      type: 'array',
      description: 'List of matching universities with detailed information'
    }
  },
  {
    id: 'fetch_news',
    name: 'Fetch News',
    description: 'Fetch latest news from universities and academic sources',
    endpoint: 'news-aggregator',
    parameters: [
      {
        name: 'university',
        type: 'string',
        required: false,
        description: 'Filter by specific university'
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        description: 'Filter by news category'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Maximum number of news articles to return',
        default: 10
      }
    ],
    returns: {
      type: 'array',
      description: 'List of news articles with metadata and content'
    }
  },
  {
    id: 'get_rankings',
    name: 'Get Rankings',
    description: 'Retrieve university rankings and performance data',
    endpoint: 'academic-rankings',
    parameters: [
      {
        name: 'year',
        type: 'number',
        required: false,
        description: 'Ranking year (defaults to current year)'
      },
      {
        name: 'country',
        type: 'string',
        required: false,
        description: 'Filter by country'
      },
      {
        name: 'subject',
        type: 'string',
        required: false,
        description: 'Filter by subject area'
      }
    ],
    returns: {
      type: 'array',
      description: 'Ranking data with scores and methodology information'
    }
  },
  {
    id: 'search_research',
    name: 'Search Research',
    description: 'Search for academic research papers and publications',
    endpoint: 'research-papers',
    parameters: [
      {
        name: 'query',
        type: 'string',
        required: true,
        description: 'Search query for research topics or keywords'
      },
      {
        name: 'author',
        type: 'string',
        required: false,
        description: 'Filter by author name'
      },
      {
        name: 'year_from',
        type: 'number',
        required: false,
        description: 'Filter by publication year (from)'
      },
      {
        name: 'year_to',
        type: 'number',
        required: false,
        description: 'Filter by publication year (to)'
      }
    ],
    returns: {
      type: 'array',
      description: 'List of research papers with metadata and abstracts'
    }
  }
];

// MCP Server Health Check Configuration
export const MCP_HEALTH_CHECK = {
  interval: 30000, // 30 seconds
  timeout: 5000,   // 5 seconds
  retries: 3,
  endpoints: MCP_SERVERS.map(server => ({
    id: server.id,
    endpoint: server.endpoint,
    healthCheck: `${server.endpoint}/health`
  }))
};

// MCP Data Sync Configuration
export const MCP_SYNC_CONFIG = {
  autoSync: true,
  syncInterval: 3600000, // 1 hour
  batchSize: 100,
  retryAttempts: 3,
  retryDelay: 5000, // 5 seconds
  servers: MCP_SERVERS.filter(server => server.status === 'available').map(server => ({
    id: server.id,
    syncEnabled: true,
    lastSync: null,
    syncFrequency: 3600000 // 1 hour
  }))
};

// MCP Error Handling Configuration
export const MCP_ERROR_HANDLING = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  exponentialBackoff: true,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000 // 1 minute
  },
  fallbackData: {
    enabled: true,
    cacheExpiry: 86400000 // 24 hours
  }
};

// MCP Cache Configuration
export const MCP_CACHE_CONFIG = {
  enabled: true,
  ttl: 3600000, // 1 hour
  maxSize: 1000,
  strategies: {
    universities: 1800000,    // 30 minutes
    news: 900000,            // 15 minutes
    rankings: 86400000,      // 24 hours
    research: 3600000        // 1 hour
  }
};

export default {
  servers: MCP_SERVERS,
  tools: MCP_TOOLS,
  healthCheck: MCP_HEALTH_CHECK,
  syncConfig: MCP_SYNC_CONFIG,
  errorHandling: MCP_ERROR_HANDLING,
  cache: MCP_CACHE_CONFIG
}; 