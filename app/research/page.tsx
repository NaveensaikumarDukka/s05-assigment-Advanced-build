'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, BookOpen, BarChart3, Loader2, AlertCircle, CheckCircle, Globe, FileText, DollarSign } from 'lucide-react'
import { getLangSmithConfig, initializeLangSmith } from '@/lib/langsmith-tracing'

interface ResearchResult {
  query: string
  timestamp: string
  sources: {
    webSearch?: any[]
    academicResearch?: any
    marketData?: any
  }
  aiAnalysis?: string
}

interface Settings {
  apiKeys: {
    openai: string
    tavily: string
    langsmith: string
  }
  openaiModel: string
}

export default function ResearchPage() {
  const [query, setQuery] = useState('')
  const [includeWebSearch, setIncludeWebSearch] = useState(true)
  const [includeAcademicResearch, setIncludeAcademicResearch] = useState(true)
  const [includeMarketData, setIncludeMarketData] = useState(true)
  const [targetSymbols, setTargetSymbols] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ResearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({
    apiKeys: {
      openai: '',
      tavily: '',
      langsmith: ''
    },
    openaiModel: 'gpt-3.5-turbo'
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('financial-research-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        
        // Initialize LangSmith if API key is available
        if (parsed.apiKeys.langsmith) {
          initializeLangSmith({
            apiKey: parsed.apiKeys.langsmith,
            project: "financial-research-agent"
          })
        }
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
        // Fallback to loading just API keys for backward compatibility
        const savedKeys = localStorage.getItem('financial-research-api-keys')
        if (savedKeys) {
          try {
            const parsedKeys = JSON.parse(savedKeys)
            setSettings(prev => ({
              ...prev,
              apiKeys: parsedKeys
            }))
            
            // Initialize LangSmith if API key is available
            if (parsedKeys.langsmith) {
              initializeLangSmith({
                apiKey: parsedKeys.langsmith,
                project: "financial-research-agent"
              })
            }
          } catch (error) {
            console.error('Failed to parse saved API keys:', error)
          }
        }
      }
    } else {
      // Check for old API keys format for backward compatibility
      const savedKeys = localStorage.getItem('financial-research-api-keys')
      if (savedKeys) {
        try {
          const parsedKeys = JSON.parse(savedKeys)
          setSettings(prev => ({
            ...prev,
            apiKeys: parsedKeys
          }))
          
          // Initialize LangSmith if API key is available
          if (parsedKeys.langsmith) {
            initializeLangSmith({
              apiKey: parsedKeys.langsmith,
              project: "financial-research-agent"
            })
          }
        } catch (error) {
          console.error('Failed to parse saved API keys:', error)
        }
      }
    }
  }, [])

  const handleResearch = async () => {
    if (!query.trim()) {
      setError('Please enter a research query')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const symbolList = targetSymbols.split(',').map(s => s.trim().toUpperCase()).filter(s => s)
      
      // Determine which API endpoint to use based on LangSmith availability
      const useLangSmith = settings.apiKeys.langsmith && settings.apiKeys.langsmith.trim() !== '';
      const apiEndpoint = useLangSmith ? '/api/research' : '/api/research/simple';
      
      console.log(`Using API endpoint: ${apiEndpoint}, LangSmith: ${useLangSmith}`);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          includeWebSearch,
          includeAcademicResearch,
          includeMarketData,
          targetSymbols: symbolList,
          openaiApiKey: settings.apiKeys.openai,
          tavilyApiKey: settings.apiKeys.tavily,
          ...(useLangSmith && { langsmithApiKey: settings.apiKeys.langsmith }),
          model: settings.openaiModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Research failed')
      }

      setResults(data.results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Research failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const exampleQueries = [
    'ESG investing strategies for wealth management',
    'Asset allocation for retirement planning',
    'Cryptocurrency portfolio diversification',
    'Real estate investment trusts (REITs) analysis',
    'Sustainable finance and green bonds',
    'Risk management in volatile markets'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Unified Financial Research Agent
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive financial research using Tavily, ArXiv, and Yahoo Finance in one unified agent
          </p>
          {settings.openaiModel && (
            <p className="text-sm text-gray-500 mt-2">
              Using AI model: <span className="font-medium">{settings.openaiModel}</span>
            </p>
          )}
        </div>

        {/* Research Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="mb-6">
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Research Query
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your financial research query (e.g., 'ESG investing strategies for wealth management')"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeWebSearch}
                  onChange={(e) => setIncludeWebSearch(e.target.checked)}
                  className="mr-2"
                />
                <Globe className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm text-gray-700">Web Search (Tavily)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAcademicResearch}
                  onChange={(e) => setIncludeAcademicResearch(e.target.checked)}
                  className="mr-2"
                />
                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                <span className="text-sm text-gray-700">Academic Research (ArXiv)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeMarketData}
                  onChange={(e) => setIncludeMarketData(e.target.checked)}
                  className="mr-2"
                />
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm text-gray-700">Market Data (Yahoo Finance)</span>
              </label>
            </div>
            <div>
              <label htmlFor="symbols" className="block text-sm font-medium text-gray-700 mb-1">
                Target Stock Symbols
              </label>
              <input
                id="symbols"
                type="text"
                value={targetSymbols}
                onChange={(e) => setTargetSymbols(e.target.value)}
                placeholder="AAPL,MSFT,GOOGL (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <button
            onClick={handleResearch}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Researching with Unified Agent...
              </>
            ) : (
              <>
                <Search className="mr-2" />
                Start Unified Research
              </>
            )}
          </button>
        </div>

        {/* Example Queries */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Example Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-left p-3 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm text-blue-800">{example}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="space-y-6">
            {/* Web Search Results */}
            {results.sources.webSearch && Array.isArray(results.sources.webSearch) && results.sources.webSearch.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Web Search Results (Tavily)</h3>
                </div>
                <div className="space-y-4">
                  {results.sources.webSearch.slice(0, 5).map((result: any, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h4 className="font-medium text-blue-600 mb-1">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {result.title}
                        </a>
                      </h4>
                      <p className="text-sm text-gray-600">
                        {typeof result.content === 'string' ? result.content : JSON.stringify(result.content)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Research */}
            {results.sources.academicResearch && !results.sources.academicResearch.error && results.sources.academicResearch.parsed && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-8 h-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Academic Research (ArXiv)</h3>
                </div>
                <div className="space-y-4">
                  {results.sources.academicResearch.parsed.map((paper: any, index: number) => (
                    <div key={index} className="border border-purple-200 rounded p-4 bg-purple-50">
                      <h4 className="font-medium text-purple-900 mb-2">{paper.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {typeof paper.summary === 'string' ? paper.summary.substring(0, 200) + '...' : JSON.stringify(paper.summary)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Published: {new Date(paper.published).toLocaleDateString()}</span>
                        {paper.link && (
                          <a 
                            href={paper.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                          >
                            View PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Data */}
            {results.sources.marketData && Object.keys(results.sources.marketData).length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Market Data (Yahoo Finance)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(results.sources.marketData).map(([symbol, data]: [string, any]) => (
                    <div key={symbol} className="border border-gray-200 rounded p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{symbol}</h4>
                      <p className="text-sm text-gray-600">
                        {data.error ? 'Error: ' + (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) : 'Data available'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {results.aiAnalysis && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">AI Analysis & Synthesis</h3>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {typeof results.aiAnalysis === 'string' 
                      ? results.aiAnalysis 
                      : (results.aiAnalysis as any)?.error 
                        ? `Error: ${typeof (results.aiAnalysis as any).error === 'string' ? (results.aiAnalysis as any).error : JSON.stringify((results.aiAnalysis as any).error)}`
                        : JSON.stringify(results.aiAnalysis)
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 