import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { AppError } from './appError.js';

let anthropicClient: Anthropic | null = env.CLAUDE_API_KEY
  ? new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    })
  : null;

const getAnthropicClient = (): Anthropic => {
  if (!anthropicClient) {
    throw new AppError(503, 'Claude service is not configured');
  }

  return anthropicClient;
};

export interface ClaudeResponse {
  success: boolean;
  data: any;
  raw: string;
  error?: string;
}

/**
 * Call Anthropic Claude for structured business insights
 */
export async function callClaude(prompt: string, model: 'claude-3-5-sonnet-20240620' | 'claude-3-haiku-20240307' = 'claude-3-5-sonnet-20240620'): Promise<ClaudeResponse> {
  try {
    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model,
      max_tokens: 2000,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: "You are a business intelligence engine. Always respond in valid JSON format only.",
    });

    const content = response.content[0];
    const raw = content.type === 'text' ? content.text : '';

    let parsedData = raw;
    try {
      const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanRaw);
    } catch {
      // Fallback to raw text if not strictly JSON
    }

    return {
      success: true,
      data: parsedData,
      raw,
    };
  } catch (error: any) {
    console.error('Claude API Error:', error);
    return {
      success: false,
      data: null,
      raw: '',
      error: error.message,
    };
  }
}

/**
 * Health check
 */
export async function checkClaudeHealth() {
  if (!anthropicClient) {
    return false;
  }

  try {
    const testPrompt = 'Respond with {"status": "ok"}';
    const result = await callClaude(testPrompt, 'claude-3-haiku-20240307');
    return result.success;
  } catch {
    return false;
  }
}

export default { callClaude, checkClaudeHealth };
