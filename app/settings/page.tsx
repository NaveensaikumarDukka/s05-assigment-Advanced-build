'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Eye, EyeOff, Save, CheckCircle, AlertCircle } from 'lucide-react'

interface ApiKeys {
  openai: string
  tavily: string
  langsmith: string
}

interface Settings {
  apiKeys: ApiKeys
  openaiModel: string
}

const OPENAI_MODELS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Low Cost)', cost: 'Low' },
  { value: 'gpt-4', label: 'GPT-4 (High Quality)', cost: 'High' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Balanced)', cost: 'Medium' },
  { value: 'gpt-4o', label: 'GPT-4o (Latest)', cost: 'High' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Cost Effective)', cost: 'Low' }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    apiKeys: {
      openai: '',
      tavily: '',
      langsmith: ''
    },
    openaiModel: 'gpt-3.5-turbo' // Default to low-cost model
  })
  const [showKeys, setShowKeys] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('financial-research-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
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
        } catch (error) {
          console.error('Failed to parse saved API keys:', error)
        }
      }
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    setStatusMessage('')

    try {
      // Save to localStorage
      localStorage.setItem('financial-research-settings', JSON.stringify(settings))
      
      setSaveStatus('success')
      setStatusMessage('Settings saved successfully!')
    } catch (error) {
      setSaveStatus('error')
      setStatusMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }



  const handleKeyChange = (key: keyof ApiKeys, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [key]: value }
    }))
    setSaveStatus('idle')
  }

  const handleModelChange = (model: string) => {
    setSettings(prev => ({ ...prev, openaiModel: model }))
    setSaveStatus('idle')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600">
            Configure your API keys and application settings
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Settings className="text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
          </div>

          {/* API Keys Section */}
          <div className="space-y-6">
            {/* OpenAI API Key */}
            <div>
              <label htmlFor="openai" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  id="openai"
                  type={showKeys ? 'text' : 'password'}
                  value={settings.apiKeys.openai}
                  onChange={(e) => handleKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(!showKeys)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Required for AI analysis and insights. Get your key from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* OpenAI Model Selection */}
            <div>
              <label htmlFor="openai-model" className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI Model
              </label>
              <select
                id="openai-model"
                value={settings.openaiModel}
                onChange={(e) => handleModelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {OPENAI_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label} ({model.cost} cost)
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose the AI model for analysis. Lower cost models are faster but may be less accurate.
              </p>
            </div>

            {/* Tavily API Key */}
            <div>
              <label htmlFor="tavily" className="block text-sm font-medium text-gray-700 mb-2">
                Tavily API Key
              </label>
              <div className="relative">
                <input
                  id="tavily"
                  type={showKeys ? 'text' : 'password'}
                  value={settings.apiKeys.tavily}
                  onChange={(e) => handleKeyChange('tavily', e.target.value)}
                  placeholder="tvly-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(!showKeys)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Required for web search and research. Get your key from{' '}
                <a href="https://tavily.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Tavily
                </a>
              </p>
            </div>

            {/* LangSmith API Key */}
            <div>
              <label htmlFor="langsmith" className="block text-sm font-medium text-gray-700 mb-2">
                LangSmith API Key (Optional)
              </label>
              <div className="relative">
                <input
                  id="langsmith"
                  type={showKeys ? 'text' : 'password'}
                  value={settings.apiKeys.langsmith}
                  onChange={(e) => handleKeyChange('langsmith', e.target.value)}
                  placeholder="lsm-... (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys(!showKeys)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showKeys ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Optional for tracing and monitoring. Get your key from{' '}
                <a href="https://smith.langchain.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  LangSmith
                </a>
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>



          {/* Status Message */}
          {saveStatus !== 'idle' && (
            <div className={`mt-4 p-4 rounded-lg flex items-center ${
              saveStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {saveStatus === 'success' ? (
                <CheckCircle className="text-green-500 mr-2" />
              ) : (
                <AlertCircle className="text-red-500 mr-2" />
              )}
              <span className={
                saveStatus === 'success' ? 'text-green-700' : 'text-red-700'
              }>
                {statusMessage}
              </span>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            About API Keys & Models
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>OpenAI API Key:</strong> Required for AI analysis and insights. Used by the unified agent for synthesizing research results.
            </p>
            <p>
              <strong>OpenAI Model:</strong> Choose the AI model for analysis. GPT-3.5 Turbo is the default low-cost option, while GPT-4 provides higher quality but costs more.
            </p>
            <p>
              <strong>Tavily API Key:</strong> Required for web search functionality. Enables the agent to find current financial information.
            </p>
            <p>
              <strong>LangSmith API Key:</strong> Optional for tracing and monitoring. Helps debug and optimize the agent performance. All research operations are automatically traced when a valid API key is provided. Project: <span className="font-medium">financial-research-agent</span>
            </p>
            <p className="text-blue-700 font-medium">
              Your API keys and settings are stored locally in your browser and are never sent to our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 