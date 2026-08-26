import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Part } from '@google/generative-ai';

export interface InlineFilePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export class GeminiError extends Error {
  public code: string;
  public details?: unknown;

  constructor(message: string, code: string = 'GEMINI_ERROR', details?: unknown) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
    this.details = details;
  }
}

export function cleanJsonString(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function generateStructured<T>(
  prompt: string,
  files: InlineFilePart[] = [],
  schemaDescription?: string
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY environment variable is not configured', 'AUTH_ERROR');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const parts: (string | Part)[] = [...files, prompt];

  let responseText = '';
  try {
    const result = await model.generateContent(parts);
    responseText = result.response.text();
    const cleaned = cleanJsonString(responseText);
    return JSON.parse(cleaned) as T;
  } catch (initialError) {
    try {
      const retryPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON string matching the required structure without any markdown commentary or text outside the JSON object.\n${schemaDescription ? `Schema requirement: ${schemaDescription}` : ''}`;
      const retryParts: (string | Part)[] = [...files, retryPrompt];
      
      const retryResult = await model.generateContent(retryParts);
      const retryText = retryResult.response.text();
      const retryCleaned = cleanJsonString(retryText);
      return JSON.parse(retryCleaned) as T;
    } catch (retryError) {
      throw new GeminiError(
        'Failed to parse structured JSON from model response after retry',
        'MALFORMED_JSON',
        { initialError, retryError, rawResponse: responseText }
      );
    }
  }
}
