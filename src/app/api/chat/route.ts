import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('🚀 Chat API route called');
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log('📨 Messages received:', messages.length);

  try {
    // Create Colombia time tool using AI SDK tool format
    console.log('🛠️ Creating Colombia time tool...');
    
    console.log('🤖 Starting streamText...');
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      system: `You are AstroFlora AI, an advanced biological intelligence assistant specializing in plant biology, genetics, biotechnology, and life sciences.

You have access to a tool that can get the current time in Colombia. When users ask about the current time in Colombia, use the get_colombia_time tool to provide accurate, real-time information.

Always be helpful, accurate, and maintain your biology expertise focus. Provide detailed and scientific responses when discussing biological topics.`,
      tools: {
        get_colombia_time: tool({
          description: 'Get the current time in Colombia (COT - Colombia Time UTC-5)',
          inputSchema: z.object({
            format: z.enum(['12', '24']).default('24').describe('Time format: 12-hour or 24-hour format'),
          }),
          execute: async ({ format }) => {
            try {
              console.log('⏰ Fetching Colombia time...');
              const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=America/Bogota');
              
              if (!response.ok) {
                throw new Error(`TimeAPI error: ${response.status}`);
              }
              
              const data = await response.json();
              const colombiaDateTime = new Date(data.dateTime);
              
              const timeOnly = new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: format === '12',
              }).format(colombiaDateTime);

              const dateOnly = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              }).format(colombiaDateTime);

              return `🕐 **Current Time in Colombia** 🇨🇴

⏰ **Time:** ${timeOnly}
📅 **Date:** ${dateOnly}  
🌍 **Timezone:** ${data.timeZone} (COT)
📍 **Location:** Colombia 🇨🇴
🔧 **Format:** ${format === '12' ? '12-hour' : '24-hour'}
🌐 **Source:** TimeAPI
⚡ **UTC Offset:** -05:00`;
              
            } catch (error) {
              console.warn('TimeAPI failed, using fallback:', error);
              
              const now = new Date();
              const timeOnly = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Bogota',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: format === '12',
              }).format(now);

              const dateOnly = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              }).format(now);

              return `🕐 **Current Time in Colombia** 🇨🇴 *(Fallback)*

⏰ **Time:** ${timeOnly}
📅 **Date:** ${dateOnly}
🌍 **Timezone:** COT (UTC-5)
📍 **Location:** Colombia 🇨🇴
🔧 **Format:** ${format === '12' ? '12-hour' : '24-hour'}
🌐 **Source:** Browser Fallback
⚠️ **Note:** TimeAPI unavailable, using system time`;
            }
          },
        }),
      },
    });

    console.log('📤 Returning stream response...');
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Fallback without tools
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      system: `You are AstroFlora AI, an advanced biological intelligence assistant specializing in plant biology, genetics, biotechnology, and life sciences.

Note: Tools are currently unavailable. For time-related queries, you can direct users to check world clock applications or suggest they try again later.

Always be helpful, accurate, and maintain your biology expertise focus.`,
    });

    return result.toUIMessageStreamResponse();
  }
}
