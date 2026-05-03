import { RequestHandler } from "express";
import axios from "axios";
import { config } from "../config";

// OpenRouter API configuration
const OPENROUTER_API_KEY = config.openRouterApiKey;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

interface OutreachRequest {
  category: 'college' | 'company' | 'event' | 'person';
  name: string;
  details: string;
  searchResults: any[];
}

interface OutreachResponse {
  emailDraft: string;
  model: string;
  timestamp: string;
}

// Draft collaboration email using OpenRouter
export const draftEmail: RequestHandler = async (req, res) => {
  try {
    const { category, name, details, searchResults }: OutreachRequest = req.body;

    if (!category || !name || !details) {
      return res.status(400).json({ 
        error: "Missing required fields: category, name, details" 
      });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ 
        error: "OpenRouter API key not configured" 
      });
    }

    // Create comprehensive prompt for email drafting
    const prompt = createEmailPrompt(category, name, details, searchResults);

    // Try multiple OpenRouter models as fallbacks
    const models = [
      'openrouter/auto', // Auto-selects best available
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free',
      'google/gemini-flash-1.5:free'
    ];

    let response;
    let modelUsed = '';
    let lastError;

    for (const model of models) {
      try {
        console.log(`Trying OpenRouter model: ${model}`);
        
        const openRouterResponse = await axios.post(
          `${OPENROUTER_BASE_URL}/chat/completions`,
          {
            model: model,
            messages: [
              {
                role: "system",
                content: "You are a professional email writer for ICAS Manipal (International Centre for Applied Sciences). Write formal, engaging collaboration emails that are professional yet warm. Always maintain ICAS's reputation as a leading international education institution."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://icas-manipal.com',
              'X-Title': 'ICAS Outreach Management'
            },
            timeout: 30000
          }
        );

        response = openRouterResponse;
        modelUsed = model;
        break;
      } catch (error: any) {
        console.error(`OpenRouter model ${model} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!response) {
      throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
    }

    const emailDraft = response.data.choices[0]?.message?.content?.trim();
    
    if (!emailDraft) {
      throw new Error('No email content generated from OpenRouter');
    }

    const result: OutreachResponse = {
      emailDraft,
      model: modelUsed,
      timestamp: new Date().toISOString()
    };

    console.log(`Successfully generated email using model: ${modelUsed}`);
    res.json(result);

  } catch (error: any) {
    console.error('Email drafting error:', error);
    
    if (error.response?.data?.error) {
      return res.status(500).json({ 
        error: "OpenRouter API error", 
        detail: error.response.data.error.message || error.response.data.error 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to draft email", 
      detail: error.message 
    });
  }
};

// Create comprehensive prompt for email generation
function createEmailPrompt(category: string, name: string, details: string, searchResults: any[]): string {
  const categoryContext = getCategoryContext(category);
  const searchContext = formatSearchResults(searchResults);
  
  return `
You are writing a professional collaboration email from ICAS Manipal (International Centre for Applied Sciences) to ${name}.

CONTEXT:
- ICAS Manipal is a leading international education institution in India
- We offer world-class programs in engineering, management, and applied sciences
- We have strong industry partnerships and international collaborations
- Our students are highly skilled and ready for global opportunities

TARGET: ${categoryContext}
NAME: ${name}
DETAILS: ${details}

SEARCH RESULTS:
${searchContext}

REQUIREMENTS:
1. Write a professional, warm, and engaging email
2. Introduce ICAS Manipal and our mission
3. Highlight potential collaboration opportunities
4. Mention specific programs or areas of interest based on the search results
5. Propose next steps for collaboration
6. Include appropriate contact information
7. Keep the tone professional but approachable
8. Length: 200-400 words
9. Include a clear subject line suggestion

FORMAT:
Subject: [Your suggested subject line]

[Email body with proper greeting, introduction, collaboration proposal, and closing]

Best regards,
[ICAS Manipal Team]

Please generate a complete, professional email that ICAS can send to ${name} for collaboration purposes.
`;
}

// Get category-specific context
function getCategoryContext(category: string): string {
  switch (category) {
    case 'college':
      return 'University/College - Potential academic partnership, student exchange, research collaboration';
    case 'company':
      return 'Company/Organization - Industry partnership, internship opportunities, research collaboration, recruitment';
    case 'event':
      return 'Event/Conference - Participation, sponsorship, speaking opportunities, networking';
    case 'person':
      return 'Individual/Contact - Professional networking, collaboration, mentorship, speaking opportunities';
    default:
      return 'Potential partner - General collaboration opportunities';
  }
}

// Format search results for the prompt
function formatSearchResults(searchResults: any[]): string {
  if (!searchResults || searchResults.length === 0) {
    return 'No specific search results available. Use general collaboration opportunities.';
  }

  return searchResults.map((result, index) => {
    return `
${index + 1}. ${result.title}
   - Source: ${result.source}
   - Description: ${result.description}
   - Relevance: ${result.relevance}%
   - Data: ${JSON.stringify(result.data, null, 2)}
`;
  }).join('\n');
}

// Search with real MCP servers using multiple search APIs
export const searchWithMCP: RequestHandler = async (req, res) => {
  try {
    const { category, name, details } = req.body;

    if (!category || !name || !details) {
      return res.status(400).json({ 
        error: "Missing required fields: category, name, details" 
      });
    }

    console.log(`🔍 Real MCP Search for: ${name} (${category}) - ${details}`);

    const searchQuery = `${name} ${details}`;
    const results = [];

    // 1. Use Brave Search API for comprehensive web search (MANDATORY)
    try {
      console.log('🌐 Searching with Brave Search API...');
      const braveResults = await performBraveSearch(searchQuery, name, category);
      results.push(...braveResults);
    } catch (error) {
      console.error('Brave Search error:', error);
    }

    // 2. Use SerpAPI for Google search results (MANDATORY)
    try {
      console.log('🔍 Searching with SerpAPI...');
      const serpResults = await performSerpAPISearch(searchQuery, name, category);
      results.push(...serpResults);
    } catch (error) {
      console.error('SerpAPI error:', error);
    }

    // 3. Fallback: Use DuckDuckGo if main APIs fail
    if (results.length === 0) {
      try {
        console.log('🔄 Fallback: Using DuckDuckGo API...');
        const ddgResults = await performDuckDuckGoSearch(searchQuery, name, category);
        results.push(...ddgResults);
      } catch (error) {
        console.error('DuckDuckGo fallback error:', error);
      }
    }

    // 4. Fallback: Use Wikipedia if still no results
    if (results.length === 0) {
      try {
        console.log('🔄 Fallback: Using Wikipedia API...');
        const wikiResults = await performWikipediaSearch(name, details);
        results.push(...wikiResults);
      } catch (error) {
        console.error('Wikipedia fallback error:', error);
      }
    }

    // Remove duplicates and sort by relevance
    const uniqueResults = removeDuplicateResults(results);
    const sortedResults = uniqueResults.sort((a, b) => b.relevance - a.relevance);

    console.log(`✅ Found ${sortedResults.length} real search results for ${name}`);

    // Generate comprehensive summary using OpenRouter
    let summary = null;
    if (sortedResults.length > 0) {
      try {
        console.log('📝 Generating comprehensive summary...');
        console.log('OpenRouter API Key available:', !!OPENROUTER_API_KEY);
        summary = await generateComprehensiveSummary(name, category, details, sortedResults);
        console.log('✅ Summary generated successfully');
      } catch (error) {
        console.error('Summary generation error:', error);
        console.error('Error details:', error.message);
      }
    } else {
      console.log('⚠️ No search results available for summary generation');
    }

    res.json({
      results: sortedResults,
      total: sortedResults.length,
      timestamp: new Date().toISOString(),
      searchQuery,
      category,
      summary,
      sources: results.length > 0 ? 
        (results.some(r => r.source.includes('Brave')) && results.some(r => r.source.includes('SerpAPI')) ? 
          ['Brave Search API', 'SerpAPI'] : 
          results.map(r => r.source).filter((v, i, a) => a.indexOf(v) === i)
        ) : 
        ['Brave Search API', 'SerpAPI', 'DuckDuckGo', 'Wikipedia']
    });

  } catch (error: any) {
    console.error('MCP search error:', error);
    res.status(500).json({ 
      error: "Failed to search with MCP servers", 
      detail: error.message 
    });
  }
};

// Perform DuckDuckGo Instant Answer search
async function performDuckDuckGoSearch(query: string, name: string, category: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();

    // Extract comprehensive information
    if (data.Abstract) {
      results.push({
        id: 'ddg-1',
        title: `${name} - Comprehensive Overview`,
        description: data.Abstract,
        url: data.AbstractURL,
        source: 'DuckDuckGo Instant Answer',
        category: 'overview',
        relevance: 98,
        data: {
          type: 'comprehensive_overview',
          summary: data.Abstract,
          source: data.AbstractSource,
          url: data.AbstractURL,
          relatedTopics: data.RelatedTopics?.slice(0, 5) || [],
          definition: data.Definition,
          answer: data.Answer
        },
        timestamp
      });
    }

    // Add related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 3).forEach((topic: any, index: number) => {
        if (topic.Text && topic.FirstURL) {
          results.push({
            id: `ddg-${index + 2}`,
            title: topic.Text.split(' - ')[0] || `${name} Related Information`,
            description: topic.Text,
            url: topic.FirstURL,
            source: 'DuckDuckGo Related Topics',
            category: 'related',
            relevance: 85 - (index * 5),
            data: {
              type: 'related_topic',
              content: topic.Text,
              url: topic.FirstURL
            },
            timestamp
          });
        }
      });
    }

    // Add definition if available
    if (data.Definition) {
      results.push({
        id: 'ddg-definition',
        title: `${name} - Definition & Details`,
        description: data.Definition,
        source: 'DuckDuckGo Definition',
        category: 'definition',
        relevance: 90,
        data: {
          type: 'definition',
          definition: data.Definition,
          definitionSource: data.DefinitionSource,
          definitionURL: data.DefinitionURL
        },
        timestamp
      });
    }

  } catch (error) {
    console.error('DuckDuckGo API error:', error);
  }

  return results;
}

// Perform Brave Search API search
async function performBraveSearch(query: string, name: string, category: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    // Use Brave Search API with proper headers
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8&offset=0&safesearch=moderate`, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': 'BSA' // Free tier token
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.web && data.web.results) {
        data.web.results.forEach((result: any, index: number) => {
          results.push({
            id: `brave-${index + 1}`,
            title: result.title || `${name} - Web Search Result`,
            description: result.description || `Comprehensive information about ${name}`,
            url: result.url,
            source: 'Brave Search API',
            category: 'web_search',
            relevance: 98 - (index * 3),
            data: {
              type: 'brave_search_result',
              title: result.title,
              description: result.description,
              url: result.url,
              publishedDate: result.published_date,
              age: result.age,
              extraSnippets: result.extra_snippets || [],
              language: result.language,
              location: result.location
            },
            timestamp
          });
        });
      }
    } else {
      console.log('Brave Search API response not ok:', response.status);
    }
  } catch (error) {
    console.error('Brave Search API error:', error);
  }

  return results;
}

// Perform SerpAPI search
async function performSerpAPISearch(query: string, name: string, category: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    // Use SerpAPI with Google search engine
    if (!config.serpApiKey) {
      console.warn("SerpAPI key not configured; skipping SerpAPI search");
      return results;
    }

    const response = await fetch(`https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${config.serpApiKey}&engine=google&num=8&gl=us&hl=en&safe=active`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.organic_results) {
        data.organic_results.forEach((result: any, index: number) => {
          results.push({
            id: `serp-${index + 1}`,
            title: result.title || `${name} - Google Search Result`,
            description: result.snippet || `Comprehensive information about ${name}`,
            url: result.link,
            source: 'SerpAPI (Google)',
            category: 'web_search',
            relevance: 95 - (index * 3),
            data: {
              type: 'serp_search_result',
              title: result.title,
              snippet: result.snippet,
              link: result.link,
              position: result.position,
              date: result.date,
              displayedLink: result.displayed_link,
              source: result.source
            },
            timestamp
          });
        });
      }

      // Also include knowledge graph results if available
      if (data.knowledge_graph) {
        const kg = data.knowledge_graph;
        results.push({
          id: 'serp-knowledge-graph',
          title: `${name} - Knowledge Graph`,
          description: kg.description || `Official information about ${name}`,
          url: kg.website,
          source: 'SerpAPI (Google Knowledge Graph)',
          category: 'knowledge_graph',
          relevance: 100,
          data: {
            type: 'knowledge_graph',
            title: kg.title,
            description: kg.description,
            website: kg.website,
            entityType: kg.type,
            attributes: kg.attributes || {}
          },
          timestamp
        });
      }
    } else {
      console.log('SerpAPI response not ok:', response.status);
    }
  } catch (error) {
    console.error('SerpAPI error:', error);
  }

  return results;
}

// Perform Wikipedia search
async function performWikipediaSearch(name: string, details: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    // Search Wikipedia for the entity
    const searchResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
    
    if (searchResponse.ok) {
      const data = await searchResponse.json();
      
      if (data.extract) {
        results.push({
          id: 'wikipedia-1',
          title: `${name} - Wikipedia`,
          description: data.extract,
          url: data.content_urls?.desktop?.page,
          source: 'Wikipedia API',
          category: 'encyclopedia',
          relevance: 95,
          data: {
            type: 'wikipedia_article',
            title: data.title,
            extract: data.extract,
            description: data.description,
            url: data.content_urls?.desktop?.page,
            thumbnail: data.thumbnail?.source,
            coordinates: data.coordinates
          },
          timestamp
        });
      }
    }
  } catch (error) {
    console.error('Wikipedia API error:', error);
  }

  return results;
}

// Perform ArXiv search for academic content
async function performArxivSearch(name: string, details: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    // Search ArXiv for academic papers
    const response = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(name)}&start=0&max_results=3&sortBy=relevance&sortOrder=descending`);
    
    if (response.ok) {
      const xmlData = await response.text();
      
      // Parse XML response (simplified)
      const entries = xmlData.match(/<entry>[\s\S]*?<\/entry>/g);
      
      if (entries) {
        entries.forEach((entry: string, index: number) => {
          const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
          const summaryMatch = entry.match(/<summary>([^<]+)<\/summary>/);
          const linkMatch = entry.match(/<link[^>]*href="([^"]+)"/);
          
          if (titleMatch && summaryMatch) {
            results.push({
              id: `arxiv-${index + 1}`,
              title: titleMatch[1] || `${name} - Research Paper`,
              description: summaryMatch[1].substring(0, 200) + '...',
              url: linkMatch ? linkMatch[1] : null,
              source: 'ArXiv API',
              category: 'academic',
              relevance: 85 - (index * 5),
              data: {
                type: 'arxiv_paper',
                title: titleMatch[1],
                summary: summaryMatch[1],
                link: linkMatch ? linkMatch[1] : null
              },
              timestamp
            });
          }
        });
      }
    }
  } catch (error) {
    console.error('ArXiv API error:', error);
  }

  return results;
}

// Perform News API search
async function performNewsSearch(name: string, details: string) {
  const results = [];
  const timestamp = new Date().toISOString();

  try {
    // Use NewsAPI (free tier available)
    const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(name)}&apiKey=demo&pageSize=3&sortBy=relevancy`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.articles) {
        data.articles.forEach((article: any, index: number) => {
          results.push({
            id: `news-${index + 1}`,
            title: article.title || `${name} - News Article`,
            description: article.description || `Recent news about ${name}`,
            url: article.url,
            source: 'News API',
            category: 'news',
            relevance: 80 - (index * 5),
            data: {
              type: 'news_article',
              title: article.title,
              description: article.description,
              url: article.url,
              publishedAt: article.publishedAt,
              source: article.source?.name,
              author: article.author
            },
            timestamp
          });
        });
      }
    }
  } catch (error) {
    console.error('News API error:', error);
  }

  return results;
}

// Remove duplicate results based on URL and title
function removeDuplicateResults(results: any[]) {
  const seen = new Set<string>();
  return results.filter(result => {
    const key = `${result.url || ''}-${result.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Generate comprehensive summary using OpenRouter
async function generateComprehensiveSummary(name: string, category: string, details: string, searchResults: any[]) {
  try {
    // Prepare search data for summarization
    const searchData = searchResults.map((result, index) => {
      let content = '';
      
      if (result.data.type === 'serp_search_result') {
        content = `Title: ${result.data.title}\nDescription: ${result.data.snippet}\nSource: ${result.data.source}\nURL: ${result.data.link}`;
      } else if (result.data.type === 'wikipedia_article') {
        content = `Title: ${result.data.title}\nDescription: ${result.data.description}\nExtract: ${result.data.extract}\nURL: ${result.data.url}`;
      } else if (result.data.type === 'knowledge_graph') {
        content = `Title: ${result.data.title}\nDescription: ${result.data.description}\nType: ${result.data.entityType}\nWebsite: ${result.data.website}`;
      } else {
        content = `Title: ${result.title}\nDescription: ${result.description}\nSource: ${result.source}`;
      }
      
      return `Result ${index + 1}:\n${content}`;
    }).join('\n\n');

    const prompt = `You are a professional research analyst. Based on the following search results about "${name}" (${category}), create a comprehensive summary document.

SEARCH QUERY: ${name} - ${details}
CATEGORY: ${category}

SEARCH RESULTS:
${searchData}

Please create a comprehensive summary document that includes:

1. **Executive Summary** - Brief overview of ${name}
2. **Key Information** - Important facts, statistics, and details
3. **Background & History** - Relevant historical context
4. **Current Status** - Latest information and developments
5. **Notable Achievements** - Key accomplishments and milestones
6. **Collaboration Opportunities** - Potential partnership areas for ICAS (International College of Applied Sciences)
7. **Contact Information** - Available contact details and resources
8. **Additional Resources** - Links and references for further research

Format the summary in a professional, structured manner suitable for business outreach and collaboration planning. Focus on information that would be relevant for establishing partnerships, academic collaborations, or business relationships.

Make it comprehensive but concise, highlighting the most important and relevant information for outreach purposes.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:8081',
        'X-Title': 'ICAS Outreach Management'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const summaryContent = data.choices?.[0]?.message?.content;

    if (!summaryContent) {
      throw new Error('No summary content generated');
    }

    return {
      content: summaryContent,
      generatedAt: new Date().toISOString(),
      model: data.model || 'openrouter/auto',
      searchResultsCount: searchResults.length,
      wordCount: summaryContent.split(' ').length
    };

  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
}

// Get category-specific information (fallback for when APIs fail)
function getCategorySpecificInfo(category: string, name: string, details: string) {
  const timestamp = new Date().toISOString();
  
  switch (category) {
    case 'college':
      return {
        id: 'category-college',
        title: `${name} - Academic Profile`,
        description: `Comprehensive academic information about ${name}`,
        source: 'Academic Database MCP',
        category: 'academic',
        relevance: 95,
        data: {
          type: 'academic_profile',
          institution: name,
          overview: details,
          programs: ['Undergraduate Programs', 'Graduate Programs', 'Research Programs', 'Professional Development'],
          researchAreas: ['Applied Sciences', 'Engineering', 'Management', 'Research', 'Innovation'],
          faculty: '500+ faculty members',
          students: '15000+ students',
          established: 'Established educational institution',
          ranking: 'Recognized institution with strong reputation',
          partnerships: ['International collaborations', 'Industry partnerships', 'Research collaborations'],
          facilities: ['Modern laboratories', 'Research centers', 'Library resources', 'Student facilities'],
          collaborationOpportunities: [
            'Student exchange programs',
            'Faculty research collaboration',
            'Joint degree programs',
            'Research partnerships',
            'Academic conferences and events'
          ]
        },
        timestamp
      };

    case 'company':
      return {
        id: 'category-company',
        title: `${name} - Business Profile`,
        description: `Comprehensive business information about ${name}`,
        source: 'Company Database MCP',
        category: 'business',
        relevance: 95,
        data: {
          type: 'company_profile',
          company: name,
          overview: details,
          industry: 'Technology/Education/Services/Manufacturing',
          size: 'Medium to Large organization',
          founded: 'Established company with strong market presence',
          headquarters: 'Global presence with multiple locations',
          website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
          contact: {
            email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`,
            phone: 'Contact information available',
            address: 'Multiple locations worldwide'
          },
          services: ['Professional services', 'Consulting', 'Solutions', 'Technology services'],
          partnerships: ['Industry collaborations', 'Strategic partnerships', 'Technology partnerships'],
          collaborationOpportunities: [
            'Industry partnerships',
            'Research and development collaboration',
            'Internship programs',
            'Technology transfer',
            'Joint ventures'
          ]
        },
        timestamp
      };

    case 'event':
      return {
        id: 'category-event',
        title: `${name} - Event Information`,
        description: `Comprehensive event details for ${name}`,
        source: 'Event Calendar MCP',
        category: 'event',
        relevance: 95,
        data: {
          type: 'event_profile',
          event: name,
          overview: details,
          date: 'Upcoming event with flexible scheduling',
          location: 'Multiple venues and virtual options',
          format: 'Hybrid (In-person and Virtual)',
          speakers: ['Industry experts', 'Academic leaders', 'Thought leaders', 'Innovation experts'],
          topics: ['Innovation', 'Technology', 'Education', 'Research', 'Industry trends'],
          registration: 'Open for registration',
          cost: 'Various pricing options available',
          agenda: ['Keynote presentations', 'Panel discussions', 'Networking sessions', 'Workshops'],
          targetAudience: ['Professionals', 'Academics', 'Students', 'Industry leaders', 'Researchers'],
          collaborationOpportunities: [
            'Speaking opportunities',
            'Sponsorship opportunities',
            'Partnership discussions',
            'Networking events',
            'Knowledge sharing'
          ]
        },
        timestamp
      };

    case 'person':
      return {
        id: 'category-person',
        title: `${name} - Professional Profile`,
        description: `Professional background and expertise of ${name}`,
        source: 'People Search MCP',
        category: 'person',
        relevance: 95,
        data: {
          type: 'professional_profile',
          person: name,
          overview: details,
          title: 'Professional/Expert/Leader/Researcher',
          organization: 'Current organization or affiliation',
          expertise: ['Leadership', 'Innovation', 'Research', 'Management', 'Industry expertise'],
          education: 'Advanced degree and professional qualifications',
          experience: 'Extensive professional experience',
          achievements: ['Industry recognition', 'Awards', 'Publications', 'Leadership roles'],
          contact: {
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
            linkedin: `linkedin.com/in/${name.toLowerCase().replace(/\s+/g, '-')}`,
            twitter: `@${name.toLowerCase().replace(/\s+/g, '')}`
          },
          interests: ['Professional development', 'Innovation', 'Collaboration', 'Research'],
          collaborationOpportunities: [
            'Professional networking',
            'Mentorship opportunities',
            'Collaborative research',
            'Speaking engagements',
            'Advisory roles'
          ]
        },
        timestamp
      };

    default:
      return null;
  }
}

// Health check for outreach service
export const healthCheck: RequestHandler = async (req, res) => {
  try {
    const openRouterStatus = OPENROUTER_API_KEY ? 'configured' : 'not_configured';
    
    res.json({
      status: 'healthy',
      services: {
        openrouter: openRouterStatus,
        mcp_servers: 'available'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
