import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context, runName, openaiApiKey, model } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log(`Starting OpenAI analysis for prompt: ${prompt.substring(0, 100)}... with model: ${model || 'default'}`);

    // Create OpenAI model instance with the specified model
    const openaiModel = new ChatOpenAI({
      openAIApiKey: openaiApiKey || process.env.OPENAI_API_KEY,
      modelName: model || "gpt-4",
      temperature: 0.1,
    });
    
    const fullPrompt = context 
      ? `Context: ${context}\n\nAnalysis Request: ${prompt}`
      : prompt;
    
    const response = await openaiModel.invoke(fullPrompt);

    return NextResponse.json({
      success: true,
      response: response.content,
      prompt,
      context: context ? 'provided' : 'none',
      model: model || 'default',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { 
        error: 'OpenAI analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'OpenAI Analysis API',
    description: 'Analyze financial information using OpenAI',
    usage: {
      method: 'POST',
      body: {
        prompt: 'string (required)',
        context: 'string (optional)',
        runName: 'string (optional)',
        openaiApiKey: 'string (optional) - for testing',
        model: 'string (optional) - OpenAI model to use'
      }
    }
  });
} 