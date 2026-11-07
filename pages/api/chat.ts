import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DINAKARAN_PERSONA } from '@/lib/persona';

type ResponseData = {
  reply?: string;
  error?: string;
};

// Priority list of ultra-fast flash-lite models with independent quota pools
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { message, history, timeGreeting } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid question/message.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check .env.local or your deployment settings.',
    });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Construct dynamic system instruction with time-based greeting context
  const dynamicGreeting = timeGreeting || 'Good day';
  const systemInstruction = `${DINAKARAN_PERSONA}

[CURRENT CONTEXT: The local time greeting for the interviewer right now is "${dynamicGreeting}". If greeting them or giving your self-introduction, use "${dynamicGreeting}" as your opening!]
`;

  // Format optional conversation history
  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const turn of history.slice(-6)) {
      if (turn.role && turn.text) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text }],
        });
      }
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  // Try candidate models in order of priority (resilient to 429/503 spikes)
  let lastError: any = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemInstruction,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350,
        },
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text().trim();

      if (text) {
        return res.status(200).json({ reply: text });
      }
    } catch (err: any) {
      console.warn(`Model ${modelName} failed or unavailable: ${err.message?.split('\n')[0]}`);
      lastError = err;
    }
  }

  return res.status(500).json({
    error: lastError?.message || 'All AI models were temporarily busy. Please try again.',
  });
}
