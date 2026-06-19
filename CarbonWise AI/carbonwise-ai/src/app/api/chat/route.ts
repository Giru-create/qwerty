import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-pro-latest'),
    system: "You are the CarbonWise AI Coach, a friendly, encouraging sustainability expert. Your goal is to help the user understand their carbon footprint, explain emission sources, and provide personalized reduction strategies. Always be concise, actionable, and supportive.",
    messages,
  });

  return (result as any).toDataStreamResponse();
}
