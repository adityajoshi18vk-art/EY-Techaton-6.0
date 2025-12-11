/**
 * LLM Client wrapper for multiple providers
 * Supports Inbuilt LLM and Google Gemini with fallback
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'gemini'; // 'inbuilt' | 'gemini'
const LLM_ENABLED = process.env.LLM_ENABLED === 'true';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const INBUILT_LLM_URL = process.env.INBUILT_LLM_URL;
const INBUILT_LLM_KEY = process.env.INBUILT_LLM_KEY;

let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

export interface LLMResponse {
  text: string;
  model: string;
  tokensUsed?: number;
  finishReason?: string;
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: string;
}

/**
 * Call LLM with automatic provider selection
 */
export async function callLLM(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  if (!LLM_ENABLED) {
    throw new Error('LLM is disabled. Set LLM_ENABLED=true in environment.');
  }

  const {
    temperature = 0.1, // Low temperature for deterministic responses
    maxTokens = 150,
    systemPrompt = 'You are a helpful automotive service assistant.',
    context = '',
  } = options;

  try {
    if (LLM_PROVIDER === 'gemini' && genAI) {
      return await callGemini(prompt, { temperature, maxTokens, systemPrompt, context });
    } else if (LLM_PROVIDER === 'inbuilt' && INBUILT_LLM_URL) {
      return await callInbuiltLLM(prompt, { temperature, maxTokens, systemPrompt, context });
    } else {
      throw new Error(`LLM provider ${LLM_PROVIDER} not configured`);
    }
  } catch (error: any) {
    console.error('LLM call failed:', error.message);
    throw error;
  }
}

/**
 * Call Google Gemini API
 */
export async function callGemini(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Check GEMINI_API_KEY.');
  }

  const {
    temperature = 0.1,
    maxTokens = 150,
    systemPrompt = 'You are a helpful automotive service assistant.',
    context = '',
  } = options;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.8,
        topK: 10,
      },
    });

    // Build full prompt with system + context + user query
    const fullPrompt = buildPrompt(systemPrompt, context, prompt);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      model: 'gemini-pro',
      finishReason: 'stop',
    };
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Call Inbuilt/Custom LLM API
 */
export async function callInbuiltLLM(
  prompt: string,
  options: LLMOptions = {}
): Promise<LLMResponse> {
  if (!INBUILT_LLM_URL) {
    throw new Error('Inbuilt LLM URL not configured. Set INBUILT_LLM_URL.');
  }

  const {
    temperature = 0.1,
    maxTokens = 150,
    systemPrompt = 'You are a helpful automotive service assistant.',
    context = '',
  } = options;

  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (INBUILT_LLM_KEY) {
      headers['Authorization'] = `Bearer ${INBUILT_LLM_KEY}`;
    }

    const fullPrompt = buildPrompt(systemPrompt, context, prompt);

    const response = await axios.post(
      INBUILT_LLM_URL,
      {
        prompt: fullPrompt,
        temperature,
        max_tokens: maxTokens,
        top_p: 0.8,
      },
      {
        headers,
        timeout: 30000, // 30 second timeout
      }
    );

    const text = response.data.text || response.data.completion || response.data.response;

    return {
      text,
      model: 'inbuilt-llm',
      tokensUsed: response.data.tokens_used,
      finishReason: response.data.finish_reason || 'stop',
    };
  } catch (error: any) {
    console.error('Inbuilt LLM error:', error.message);
    throw new Error(`Inbuilt LLM error: ${error.message}`);
  }
}

/**
 * Build complete prompt with system, context, and user query
 */
function buildPrompt(systemPrompt: string, context: string, userQuery: string): string {
  let prompt = systemPrompt;

  if (context) {
    prompt += `\n\nRelevant Information:\n${context}`;
    prompt += '\n\nIMPORTANT: Base your answer ONLY on the information provided above. If the information is not available or you are unsure, say "I don\'t have that information" and offer to help book an appointment or connect with a service advisor.';
  }

  prompt += `\n\nUser Question: ${userQuery}`;
  prompt += '\n\nAssistant:';

  return prompt;
}

/**
 * Check if LLM is available
 */
export function isLLMAvailable(): boolean {
  if (!LLM_ENABLED) {
    return false;
  }

  return !!(
    (LLM_PROVIDER === 'gemini' && GEMINI_API_KEY) ||
    (LLM_PROVIDER === 'inbuilt' && INBUILT_LLM_URL)
  );
}

/**
 * Get LLM status information
 */
export function getLLMStatus() {
  return {
    enabled: LLM_ENABLED,
    provider: LLM_PROVIDER,
    available: isLLMAvailable(),
    config: {
      gemini: !!GEMINI_API_KEY,
      inbuilt: !!INBUILT_LLM_URL,
    },
  };
}
