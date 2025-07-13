import { Client } from "langsmith";
import { v4 as uuidv4 } from 'uuid';

// LangSmith tracing configuration
export interface LangSmithConfig {
  apiKey: string;
  project?: string;
  endpoint?: string;
}

// Global LangSmith client instance
let langsmithClient: Client | null = null;

// Initialize LangSmith tracing
export function initializeLangSmith(config: LangSmithConfig) {
  try {
    // Create LangSmith client
    langsmithClient = new Client({
      apiKey: config.apiKey,
      apiUrl: config.endpoint || "https://api.smith.langchain.com",
    });
    
    // Set environment variables for compatibility
    if (typeof window !== 'undefined') {
      (window as any).LANGSMITH_TRACING = "true";
      (window as any).LANGSMITH_API_KEY = config.apiKey;
      (window as any).LANGSMITH_PROJECT = config.project || "financial-research-agent";
      (window as any).LANGSMITH_ENDPOINT = config.endpoint || "https://api.smith.langchain.com";
    } else {
      process.env.LANGSMITH_TRACING = "true";
      process.env.LANGSMITH_API_KEY = config.apiKey;
      process.env.LANGSMITH_PROJECT = config.project || "financial-research-agent";
      process.env.LANGSMITH_ENDPOINT = config.endpoint || "https://api.smith.langchain.com";
    }
    
    console.log('LangSmith client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize LangSmith client:', error);
    throw error;
  }
}

// Get LangSmith client
export function getLangSmithClient(): Client | null {
  return langsmithClient;
}

// Create a trace run
export async function createTraceRun(
  name: string,
  runType: "llm" | "chain" | "tool" = "chain",
  inputs: Record<string, any> = {},
  projectName?: string
): Promise<string> {
  if (!langsmithClient) {
    throw new Error('LangSmith client not initialized');
  }

  // Generate a proper UUID for the run
  const runId = uuidv4();
  
  // Create the run using LangSmith client
  await langsmithClient.createRun({
    id: runId,
    name,
    run_type: runType,
    inputs,
    project_name: projectName || "financial-research-agent",
    start_time: Date.now(),
  });
  
  return runId;
}

// Update a trace run
export async function updateTraceRun(
  runId: string,
  updates: {
    outputs?: Record<string, any>;
    error?: string;
    end_time?: Date;
  }
) {
  if (!langsmithClient) {
    throw new Error('LangSmith client not initialized');
  }

  await langsmithClient.updateRun(runId, {
    ...updates,
    end_time: updates.end_time ? updates.end_time.getTime() : Date.now(),
  });
}

// Trace a function execution
export async function traceFunction<T>(
  name: string,
  runType: "llm" | "chain" | "tool",
  inputs: Record<string, any>,
  operation: () => Promise<T>,
  projectName?: string
): Promise<T> {
  if (!langsmithClient) {
    // If LangSmith is not available, just run the operation
    console.warn('LangSmith client not available, running without tracing');
    return operation();
  }

  let runId: string | undefined;
  
  try {
    // Create the trace run
    runId = await createTraceRun(name, runType, inputs, projectName);
    
    // Execute the operation
    const result = await operation();
    
    // Update the run with outputs
    if (runId) {
      await updateTraceRun(runId, {
        outputs: { result },
        end_time: new Date(),
      });
    }
    
    return result;
  } catch (error) {
    // Update the run with error
    if (runId) {
      await updateTraceRun(runId, {
        error: error instanceof Error ? error.message : String(error),
        end_time: new Date(),
      });
    }
    throw error;
  }
}

// Trace OpenAI API calls
export async function traceOpenAICall<T>(
  name: string,
  inputs: Record<string, any>,
  operation: () => Promise<T>
): Promise<T> {
  return traceFunction(name, "llm", inputs, operation);
}

// Trace research operations
export async function traceResearchOperation<T>(
  name: string,
  inputs: Record<string, any>,
  operation: () => Promise<T>
): Promise<T> {
  return traceFunction(name, "chain", inputs, operation);
}

// Trace tool operations
export async function traceToolOperation<T>(
  name: string,
  inputs: Record<string, any>,
  operation: () => Promise<T>
): Promise<T> {
  return traceFunction(name, "tool", inputs, operation);
}

// Test LangSmith API key
export async function testLangSmithAPI(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const testClient = new Client({
      apiKey,
      apiUrl: "https://api.smith.langchain.com",
    });

    // Test the connection by listing projects
    await testClient.listProjects();
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Get LangSmith configuration from localStorage (client-side) or environment (server-side)
export function getLangSmithConfig(): LangSmithConfig | null {
  if (typeof window !== 'undefined') {
    // Client-side: get from localStorage
    try {
      const settings = localStorage.getItem('financial-research-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.apiKeys?.langsmith) {
          return {
            apiKey: parsed.apiKeys.langsmith,
            project: "financial-research-agent",
            endpoint: "https://api.smith.langchain.com"
          };
        }
      }
    } catch (error) {
      console.error('Failed to get LangSmith config from localStorage:', error);
    }
  } else {
    // Server-side: get from environment variables (fallback)
    const apiKey = process.env.LANGSMITH_API_KEY;
    if (apiKey) {
      return {
        apiKey,
        project: process.env.LANGSMITH_PROJECT || "financial-research-agent",
        endpoint: process.env.LANGSMITH_ENDPOINT || "https://api.smith.langchain.com"
      };
    }
  }
  
  return null;
}

// Get LangSmith configuration with explicit API key parameter
export function getLangSmithConfigWithKey(apiKey?: string): LangSmithConfig | null {
  if (apiKey) {
    return {
      apiKey,
      project: "financial-research-agent",
      endpoint: "https://api.smith.langchain.com"
    };
  }
  
  // Fallback to localStorage/environment
  return getLangSmithConfig();
} 