import { ChatOpenAI } from "@langchain/openai";
import axios from "axios";

// Tool: Tavily Search
async function tavilySearch(query: string, apiKey?: string) {
  try {
    const response = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey || process.env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 10
    });
    return response.data.results;
  } catch (error) {
    console.error('Tavily search error:', error);
    throw error;
  }
}

// Tool: ArXiv Search
async function arxivSearch(query: string) {
  try {
    const response = await axios.get(
      `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`
    );
    return response.data;
  } catch (error) {
    console.error('ArXiv search error:', error);
    throw error;
  }
}

// Tool: Yahoo Finance News
async function yahooFinanceNews(symbol?: string) {
  try {
    let url = 'https://query1.finance.yahoo.com/v8/finance/chart/SPY'; // Default to S&P 500
    if (symbol) {
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    }
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Yahoo Finance error:', error);
    throw error;
  }
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

// Main Financial Agent (Simplified without LangSmith)
export class FinancialResearchAgentSimple {
  private openaiApiKey?: string;
  private tavilyApiKey?: string;
  private model: string;

  constructor(openaiApiKey?: string, tavilyApiKey?: string, model: string = 'gpt-3.5-turbo') {
    this.openaiApiKey = openaiApiKey;
    this.tavilyApiKey = tavilyApiKey;
    this.model = model;
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

    console.log(`[Financial Agent Simple] Starting comprehensive research for: ${query} with model: ${this.model}`);

    const results: any = {
      query,
      timestamp: new Date().toISOString(),
      sources: {}
    };

    try {
      // Step 1: Web Search (Tavily)
      if (includeWebSearch) {
        console.log('[Financial Agent Simple] Performing web search...');
        try {
          results.sources.webSearch = await tavilySearch(
            `financial research ${query} wealth management asset management`,
            this.tavilyApiKey
          );
        } catch (error) {
          console.error('[Financial Agent Simple] Web search failed:', error);
          results.sources.webSearch = { error: 'Web search failed' };
        }
      }

      // Step 2: Academic Research (ArXiv)
      if (includeAcademicResearch) {
        console.log('[Financial Agent Simple] Searching academic papers...');
        try {
          const arxivData = await arxivSearch(`finance wealth management asset management ${query}`);
          results.sources.academicResearch = {
            raw: arxivData,
            parsed: parseArxivData(arxivData)
          };
        } catch (error) {
          console.error('[Financial Agent Simple] Academic research failed:', error);
          results.sources.academicResearch = { error: 'Academic research failed' };
        }
      }

      // Step 3: Market Data (Yahoo Finance)
      if (includeMarketData) {
        console.log('[Financial Agent Simple] Fetching market data...');
        try {
          results.sources.marketData = {};
          
          // Extract potential stock symbols from query
          const extractedSymbols = this.extractStockSymbols(query);
          const symbolsToCheck = Array.from(new Set([...targetSymbols, ...extractedSymbols]));
          
          for (const symbol of symbolsToCheck.slice(0, 5)) { // Limit to 5 symbols
            try {
              results.sources.marketData[symbol] = await yahooFinanceNews(symbol);
            } catch (error) {
              console.warn(`[Financial Agent Simple] Failed to fetch market data for ${symbol}:`, error);
              results.sources.marketData[symbol] = { error: `Failed to fetch data for ${symbol}` };
            }
          }
        } catch (error) {
          console.error('[Financial Agent Simple] Market data failed:', error);
          results.sources.marketData = { error: 'Market data failed' };
        }
      }

      // Step 4: AI Analysis and Synthesis
      console.log('[Financial Agent Simple] Performing AI analysis...');
      try {
        const analysisPrompt = this.buildAnalysisPrompt(query, results.sources);
        const analysis = await this.analyzeWithAI(analysisPrompt);
        results.aiAnalysis = analysis;
      } catch (error) {
        console.error('[Financial Agent Simple] AI analysis failed:', error);
        results.aiAnalysis = { error: 'AI analysis failed' };
      }

      console.log('[Financial Agent Simple] Research completed successfully');
      return results;

    } catch (error) {
      console.error('[Financial Agent Simple] Research failed:', error);
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

    if (sources.webSearch && !sources.webSearch.error) {
      prompt += `WEB SEARCH RESULTS:\n`;
      sources.webSearch.forEach((result: any, index: number) => {
        prompt += `${index + 1}. ${result.title}: ${result.content}\n`;
      });
      prompt += '\n';
    }

    if (sources.academicResearch && !sources.academicResearch.error && sources.academicResearch.parsed) {
      prompt += `ACADEMIC RESEARCH:\n`;
      sources.academicResearch.parsed.forEach((paper: any, index: number) => {
        prompt += `${index + 1}. ${paper.title}: ${paper.summary}\n`;
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

    return prompt;
  }

  async analyzeWithAI(prompt: string, context?: string) {
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