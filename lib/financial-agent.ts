import { ChatOpenAI } from "@langchain/openai";
import axios from "axios";
import {
  initializeLangSmith,
  traceFunction,
  getLangSmithConfig,
  getLangSmithConfigWithKey
} from "./langsmith-tracing";

// Tool: Tavily Search
async function tavilySearch(query: string, apiKey?: string) {
  return axios.post('https://api.tavily.com/search', {
    api_key: apiKey || process.env.TAVILY_API_KEY,
    query,
    search_depth: "basic",
    max_results: 10
  }).then(response => response.data.results);
}

// Tool: ArXiv Search
async function arxivSearch(query: string) {
  return axios.get(
    `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`
  ).then(response => response.data);
}

// Tool: Yahoo Finance News
async function yahooFinanceNews(symbol?: string) {
  let url = 'https://query1.finance.yahoo.com/v8/finance/chart/SPY'; // Default to S&P 500
  if (symbol) {
    url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
  }
  
  return axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }).then(response => response.data);
}

// Parse ArXiv XML data using regex (server-compatible)
function parseArxivData(xmlData: string) {
  try {
    const papers: Array<{
      title: string;
      summary: string;
      published: string;
      link: string;
      id: string;
    }> = [];
    
    // Extract entries using regex
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const entries = xmlData.match(entryRegex);
    
    if (!entries) {
      console.warn('No entries found in ArXiv data');
      return papers;
    }
    
    entries.forEach((entry) => {
      // Extract title
      const titleMatch = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].trim() : '';
      
      // Extract summary
      const summaryMatch = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
      const summary = summaryMatch ? summaryMatch[1].trim() : '';
      
      // Extract published date
      const publishedMatch = entry.match(/<published[^>]*>([\s\S]*?)<\/published>/);
      const published = publishedMatch ? publishedMatch[1].trim() : '';
      
      // Extract PDF link
      const linkMatch = entry.match(/<link[^>]*title="pdf"[^>]*href="([^"]*)"[^>]*>/);
      const link = linkMatch ? linkMatch[1] : '';
      
      // Extract ID
      const idMatch = entry.match(/<id[^>]*>([\s\S]*?)<\/id>/);
      const id = idMatch ? idMatch[1].trim() : '';
      
      if (title && summary) {
        papers.push({
          title,
          summary,
          published,
          link,
          id
        });
      }
    });
    
    return papers;
  } catch (error) {
    console.error('Failed to parse ArXiv data:', error);
    return [];
  }
}

// Main Financial Agent
export class FinancialResearchAgent {
  private openaiApiKey?: string;
  private tavilyApiKey?: string;
  private model: string;
  private langsmithApiKey?: string;

  constructor(openaiApiKey?: string, tavilyApiKey?: string, model: string = 'gpt-3.5-turbo', langsmithApiKey?: string) {
    this.openaiApiKey = openaiApiKey;
    this.tavilyApiKey = tavilyApiKey;
    this.model = model;
    this.langsmithApiKey = langsmithApiKey;
  }

  async research(query: string, options: {
    includeWebSearch?: boolean;
    includeAcademicResearch?: boolean;
    includeMarketData?: boolean;
    targetSymbols?: string[];
  } = {}) {
    const {
      includeWebSearch = true,
      includeAcademicResearch = true,
      includeMarketData = true,
      targetSymbols = []
    } = options;

    // Initialize LangSmith tracing with the API key from UI if available
    let langsmithConfig = getLangSmithConfigWithKey(this.langsmithApiKey);
    if (langsmithConfig) {
      try {
        initializeLangSmith(langsmithConfig);
      } catch (e) {
        console.warn('LangSmith initialization failed, running without tracing:', e);
        langsmithConfig = null;
      }
    }

    // Use LangSmith tracing if available, otherwise just run the operation
    return traceFunction(
      "Financial Research Agent",
      "chain",
      {
        query,
        options,
        model: this.model,
        includeWebSearch,
        includeAcademicResearch,
        includeMarketData,
        targetSymbols
      },
      async () => {
        const results: any = {
          query,
          timestamp: new Date().toISOString(),
          sources: {}
        };

        try {
          // Step 1: Web Search (Tavily)
          if (includeWebSearch) {
            try {
              results.sources.webSearch = await tavilySearch(
                `financial research ${query} wealth management asset management`,
                this.tavilyApiKey
              );
            } catch (error) {
              results.sources.webSearch = { error: 'Web search failed' };
            }
          }

          // Step 2: Academic Research (ArXiv)
          if (includeAcademicResearch) {
            try {
              const arxivData = await arxivSearch(`finance wealth management asset management ${query}`);
              results.sources.academicResearch = {
                raw: arxivData,
                parsed: parseArxivData(arxivData)
              };
            } catch (error) {
              results.sources.academicResearch = { error: 'Academic research failed' };
            }
          }

          // Step 3: Market Data (Yahoo Finance)
          if (includeMarketData) {
            try {
              results.sources.marketData = {};
              const extractedSymbols = this.extractStockSymbols(query);
              const symbolsToCheck = Array.from(new Set([...targetSymbols, ...extractedSymbols]));
              for (const symbol of symbolsToCheck.slice(0, 5)) {
                try {
                  results.sources.marketData[symbol] = await yahooFinanceNews(symbol);
                } catch (error) {
                  results.sources.marketData[symbol] = { error: `Failed to fetch data for ${symbol}` };
                }
              }
            } catch (error) {
              results.sources.marketData = { error: 'Market data failed' };
            }
          }

          // Step 4: AI Analysis and Synthesis
          try {
            const analysisPrompt = this.buildAnalysisPrompt(query, results.sources);
            console.log('[Financial Agent] AI Analysis prompt length:', analysisPrompt.length);
            const analysis = await this.analyzeWithAI(analysisPrompt);
            results.aiAnalysis = analysis;
          } catch (error) {
            console.error('[Financial Agent] AI analysis failed:', error);
            results.aiAnalysis = { 
              error: error instanceof Error ? error.message : 'AI analysis failed',
              details: error instanceof Error ? error.stack : undefined
            };
          }

          return results;
        } catch (error) {
          throw error;
        }
      },
      "financial-research-agent"
    );
  }

  // Research method without LangSmith tracing
  private async researchWithoutTracing(query: string, options: {
    includeWebSearch?: boolean;
    includeAcademicResearch?: boolean;
    includeMarketData?: boolean;
    targetSymbols?: string[];
  } = {}) {
    const {
      includeWebSearch = true,
      includeAcademicResearch = true,
      includeMarketData = true,
      targetSymbols = []
    } = options;

    console.log(`[Financial Agent] Starting comprehensive research for: ${query} with model: ${this.model}`);

    const results: any = {
      query,
      timestamp: new Date().toISOString(),
      sources: {}
    };

    try {
      // Step 1: Web Search (Tavily)
      if (includeWebSearch) {
        console.log('[Financial Agent] Performing web search...');
        try {
          results.sources.webSearch = await tavilySearch(
            `financial research ${query} wealth management asset management`,
            this.tavilyApiKey
          );
        } catch (error) {
          console.error('[Financial Agent] Web search failed:', error);
          results.sources.webSearch = { error: 'Web search failed' };
        }
      }

      // Step 2: Academic Research (ArXiv)
      if (includeAcademicResearch) {
        console.log('[Financial Agent] Searching academic papers...');
        try {
          const arxivData = await arxivSearch(`finance wealth management asset management ${query}`);
          results.sources.academicResearch = {
            raw: arxivData,
            parsed: parseArxivData(arxivData)
          };
        } catch (error) {
          console.error('[Financial Agent] Academic research failed:', error);
          results.sources.academicResearch = { error: 'Academic research failed' };
        }
      }

      // Step 3: Market Data (Yahoo Finance)
      if (includeMarketData) {
        console.log('[Financial Agent] Fetching market data...');
        try {
          results.sources.marketData = {};
          
          // Extract potential stock symbols from query
          const extractedSymbols = this.extractStockSymbols(query);
          const symbolsToCheck = Array.from(new Set([...targetSymbols, ...extractedSymbols]));
          
          for (const symbol of symbolsToCheck.slice(0, 5)) { // Limit to 5 symbols
            try {
              results.sources.marketData[symbol] = await yahooFinanceNews(symbol);
            } catch (error) {
              console.warn(`[Financial Agent] Failed to fetch market data for ${symbol}:`, error);
              results.sources.marketData[symbol] = { error: `Failed to fetch data for ${symbol}` };
            }
          }
        } catch (error) {
          console.error('[Financial Agent] Market data failed:', error);
          results.sources.marketData = { error: 'Market data failed' };
        }
      }

      // Step 4: AI Analysis and Synthesis
      console.log('[Financial Agent] Performing AI analysis...');
      try {
        const analysisPrompt = this.buildAnalysisPrompt(query, results.sources);
        const analysis = await this.analyzeWithAIWithoutTracing(analysisPrompt);
        results.aiAnalysis = analysis;
      } catch (error) {
        console.error('[Financial Agent] AI analysis failed:', error);
        results.aiAnalysis = { error: 'AI analysis failed' };
      }

      console.log('[Financial Agent] Research completed successfully');
      return results;

    } catch (error) {
      console.error('[Financial Agent] Research failed:', error);
      throw error;
    }
  }

  private extractStockSymbols(query: string): string[] {
    const symbolPattern = /\b[A-Z]{1,5}\b/g;
    const matches = query.match(symbolPattern);
    return matches ? matches.filter(symbol => symbol.length >= 2) : [];
  }

  private buildAnalysisPrompt(query: string, sources: any): string {
    let prompt = `You are a financial research analyst. Analyze the following information about "${query}" and provide comprehensive insights for wealth and asset management.\n\n`;

    if (sources.webSearch && !sources.webSearch.error && Array.isArray(sources.webSearch)) {
      prompt += `WEB SEARCH RESULTS:\n`;
      sources.webSearch.slice(0, 3).forEach((result: any, index: number) => {
        const title = result.title || 'No title';
        const content = typeof result.content === 'string' ? result.content.substring(0, 500) : 'No content available';
        prompt += `${index + 1}. ${title}: ${content}\n`;
      });
      prompt += '\n';
    }

    if (sources.academicResearch && !sources.academicResearch.error && sources.academicResearch.parsed && Array.isArray(sources.academicResearch.parsed)) {
      prompt += `ACADEMIC RESEARCH:\n`;
      sources.academicResearch.parsed.slice(0, 2).forEach((paper: any, index: number) => {
        const title = paper.title || 'No title';
        const summary = typeof paper.summary === 'string' ? paper.summary.substring(0, 300) : 'No summary available';
        prompt += `${index + 1}. ${title}: ${summary}\n`;
      });
      prompt += '\n';
    }

    if (sources.marketData && Object.keys(sources.marketData).length > 0) {
      prompt += `MARKET DATA AVAILABLE FOR: ${Object.keys(sources.marketData).join(', ')}\n\n`;
    }

    prompt += `Please provide:\n`;
    prompt += `1. Key insights and trends\n`;
    prompt += `2. Investment implications\n`;
    prompt += `3. Risk considerations\n`;
    prompt += `4. Recommendations for wealth management\n`;
    prompt += `5. Academic research implications\n`;

    // Limit prompt length to avoid token limits
    const maxLength = 4000;
    if (prompt.length > maxLength) {
      prompt = prompt.substring(0, maxLength) + '\n\n[Content truncated due to length]';
    }

    return prompt;
  }

  async analyzeWithAI(prompt: string, context?: string) {
    const apiKey = this.openaiApiKey || process.env.OPENAI_API_KEY;
    console.log('[Financial Agent] Using OpenAI API key:', apiKey ? 'Key provided' : 'No key found');
    console.log('[Financial Agent] Model:', this.model);
    console.log('[Financial Agent] Prompt length:', prompt.length);
    
    return axios.post('https://api.openai.com/v1/chat/completions', {
      model: this.model,
      messages: [
        {
          role: "user",
          content: context ? `Context: ${context}\n\nAnalysis Request: ${prompt}` : prompt
        }
      ],
      temperature: 0.1,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }).then(response => response.data.choices[0].message.content);
  }

  async analyzeWithAIWithoutTracing(prompt: string, context?: string) {
    // Create OpenAI model instance with the specified model
    const openaiModel = new ChatOpenAI({
      openAIApiKey: this.openaiApiKey || process.env.OPENAI_API_KEY,
      modelName: this.model,
      temperature: 0.1,
    });
    
    const fullPrompt = context 
      ? `Context: ${context}\n\nAnalysis Request: ${prompt}`
      : prompt;
    
    const response = await openaiModel.invoke(fullPrompt);
    return response.content;
  }
} 