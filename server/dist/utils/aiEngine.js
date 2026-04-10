import OpenAI from 'openai';
import { env } from '../config/env.js';
import { AppError } from './appError.js';
export class AIEngine {
    /**
     * Universal completion method with automated fallback
     */
    static async generateCompletion(prompt, options = {}) {
        const { preferredProvider = 'claude', fallbackEnabled = true } = options;
        // Priority queue of providers
        const providers = [preferredProvider];
        if (fallbackEnabled) {
            if (preferredProvider !== 'openai')
                providers.push('openai');
            if (preferredProvider !== 'claude')
                providers.push('claude');
            if (preferredProvider !== 'blackbox')
                providers.push('blackbox');
        }
        const errors = [];
        console.log(`🤖 AIEngine: Attempting completion with providers: ${providers.join(', ')}`);
        for (const provider of providers) {
            try {
                console.log(`📡 AIEngine: Calling ${provider}...`);
                const result = await this.callProvider(provider, prompt);
                if (result.success) {
                    console.log(`✅ AIEngine: ${provider} success!`);
                    return result;
                }
                console.warn(`⚠️ AIEngine: ${provider} failed: ${result.error}`);
                errors.push(`${provider}: ${result.error}`);
            }
            catch (err) {
                console.error(`❌ AIEngine: ${provider} exception:`, err.message);
                errors.push(`${provider}: ${err.message}`);
            }
        }
        throw new AppError(503, `All AI providers failed: ${errors.join(' | ')}`);
    }
    static async callProvider(provider, prompt) {
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
    static async callOpenAI(prompt) {
        if (!this.openai)
            return { success: false, content: '', provider: 'openai', model: '', error: 'API key missing' };
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
    static async callClaude(prompt) {
        const { callClaude } = await import('./claude.js');
        const result = await callClaude(prompt, 'claude-3-5-sonnet-20240620');
        return {
            success: result.success,
            content: result.raw,
            provider: 'claude',
            model: 'claude-3-5-sonnet',
            error: result.error
        };
    }
    static async callBlackbox(prompt) {
        if (!env.BLACKBOX_API_KEY)
            return { success: false, content: '', provider: 'blackbox', model: '', error: 'API key missing' };
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
        if (!response.ok)
            return { success: false, content: '', provider: 'blackbox', model: '', error: 'Blackbox API error' };
        const text = await response.text();
        return {
            success: true,
            content: text,
            provider: 'blackbox',
            model: 'blackbox-ultra'
        };
    }
}
AIEngine.openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
