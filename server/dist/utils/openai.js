import OpenAI from 'openai';
import { env } from '../config/env';
import { AppError } from './appError';
let openaiClient = env.OPENAI_API_KEY
    ? new OpenAI({
        apiKey: env.OPENAI_API_KEY,
    })
    : null;
const getOpenAIClient = () => {
    if (!openaiClient) {
        throw new AppError(503, 'AI service is not configured');
    }
    return openaiClient;
};
/**
 * Call OpenAI ChatGPT with JSON mode for structured business insights
 */
export async function callOpenAI(prompt, model = 'gpt-4o-mini') {
    try {
        const openai = getOpenAIClient();
        const completion = await openai.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1, // Low for consistent analysis
            max_tokens: 2000,
            response_format: { type: 'json_object' }, // Force JSON
        });
        const raw = completion.choices[0]?.message?.content || '';
        return {
            success: true,
            data: raw,
            raw,
        };
    }
    catch (error) {
        return {
            success: false,
            data: null,
            raw: '',
            error: error.message,
        };
    }
}
/**
 * Safely parse AI JSON response
 */
export function parseAIResponse(response) {
    if (!response.success || !response.data) {
        return { error: response.error || 'No response', success: false };
    }
    try {
        // Safe JSON parse with reviver for numbers/dates
        const parsed = JSON.parse(response.data, (key, value) => {
            if (typeof value === 'string') {
                const num = parseFloat(value);
                if (!isNaN(num))
                    return num;
                const date = new Date(value);
                if (!isNaN(date.getTime()))
                    return date;
            }
            return value;
        });
        return {
            ...parsed,
            success: true,
            parsedAt: new Date(),
        };
    }
    catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        return {
            error: 'Failed to parse AI response as JSON',
            raw: response.raw,
            success: false,
        };
    }
}
// Health check
export async function checkOpenAIHealth() {
    if (!openaiClient) {
        return false;
    }
    const testPrompt = 'Respond with {"status": "ok"}';
    const result = await callOpenAI(testPrompt);
    return result.success;
}
export default { callOpenAI, parseAIResponse, checkOpenAIHealth };
