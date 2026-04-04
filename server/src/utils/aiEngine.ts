import OpenAI from 'openai';
import { env } from '../config/env.js';
import { AppError } from './appError.js';


export type AIProvider = 'openai' | 'claude' | 'blackbox';

export interface AIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  model: string;
  error?: string;
}

export interface AIEngineOptions {
  preferredProvider?: AIProvider;
  fallbackEnabled?: boolean;
}

export class AIEngine {
  private static openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

  /**
   * Universal completion method with automated fallback
   */
  static async generateCompletion(
    prompt: string,
    options: AIEngineOptions = {}
  ): Promise<AIResponse> {
    const { preferredProvider = 'openai', fallbackEnabled = true } = options;
    
    // Priority queue of providers
    const providers: AIProvider[] = [preferredProvider];
    if (fallbackEnabled) {
      if (preferredProvider !== 'openai') providers.push('openai');
      if (preferredProvider !== 'claude') providers.push('claude');
      if (preferredProvider !== 'blackbox') providers.push('blackbox');
    }

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        const result = await this.callProvider(provider, prompt);
        if (result.success) return result;
        errors.push(`${provider}: ${result.error}`);
      } catch (err: any) {
        errors.push(`${provider}: ${err.message}`);
      }
    }

    throw new AppError(503, `All AI providers failed: ${errors.join(' | ')}`);
  }

  private static async callProvider(provider: AIProvider, prompt: string): Promise<AIResponse> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(prompt);
      case 'claude':
        return this.callClaude(prompt);
      case 'blackbox':
        return this.callBlackbox(prompt);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private static async callOpenAI(prompt: string): Promise<AIResponse> {
    if (!this.openai) return { success: false, content: '', provider: 'openai', model: '', error: 'API key missing' };
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    return {
      success: true,
      content: response.choices[0].message?.content || '',
      provider: 'openai',
      model: 'gpt-4o-mini'
    };
  }

  private static async callClaude(prompt: string): Promise<AIResponse> {
    if (!env.CLAUDE_API_KEY) return { success: false, content: '', provider: 'claude', model: '', error: 'API key missing' };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json() as any;
    if (!response.ok) return { success: false, content: '', provider: 'claude', model: '', error: data.error?.message || 'Claude error' };

    return {
      success: true,
      content: data.content[0]?.text || '',
      provider: 'claude',
      model: 'claude-3-haiku'
    };
  }

  private static async callBlackbox(prompt: string): Promise<AIResponse> {
    if (!env.BLACKBOX_API_KEY) return { success: false, content: '', provider: 'blackbox', model: '', error: 'API key missing' };

    // Assuming Blackbox OpenAI-compatible or specific endpoint
    const response = await fetch('https://api.blackbox.ai/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        id: 'premium-analysis',
        previewToken: env.BLACKBOX_API_KEY
      })
    });

    if (!response.ok) return { success: false, content: '', provider: 'blackbox', model: '', error: 'Blackbox API error' };
    const text = await response.text();

    return {
      success: true,
      content: text,
      provider: 'blackbox',
      model: 'blackbox-ultra'
    };
  }
}
