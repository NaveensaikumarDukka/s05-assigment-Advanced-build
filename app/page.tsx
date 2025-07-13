'use client'

import Link from 'next/link'
import { Search, Settings, Brain } from 'lucide-react'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Financial Research Agent
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered research assistant for wealth and asset management. 
          Leverage advanced tools to analyze markets, research companies, and make informed financial decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link href="/research" className="group">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="flex items-center mb-4">
              <Search className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Unified Research</h2>
            </div>
            <p className="text-gray-600">
              Conduct comprehensive financial research using Tavily search, OpenAI analysis, and market data in one unified agent.
            </p>
          </div>
        </Link>



        <Link href="/settings" className="group">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
            </div>
            <p className="text-gray-600">
              Configure API keys, select AI models, and manage application settings.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 text-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h3>
          <p className="text-gray-600 mb-6">
            To use the Financial Research Agent, you'll need to configure your API keys in the Settings section:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">OpenAI API Key</h4>
              <p className="text-blue-700">Required for AI analysis and insights. Choose from different models including GPT-3.5 Turbo (low cost) to GPT-4 (high quality).</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Tavily API Key</h4>
              <p className="text-green-700">Required for web search and research. Enables the agent to find current financial information.</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">LangSmith API Key</h4>
              <p className="text-purple-700">Required for tracing and monitoring. Helps debug and optimize the agent performance.</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-yellow-600 mr-2" />
              <h4 className="font-semibold text-yellow-900">AI Model Selection</h4>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              Choose your preferred OpenAI model in Settings. GPT-3.5 Turbo is the default low-cost option, while GPT-4 provides higher quality analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 