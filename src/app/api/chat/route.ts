import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from 'ai';
import { 
  getSensorDataTool, 
  analyzeEnvironmentalConditionsTool, 
  searchConversationsTool, 
  getConversationStatsTool, 
  addConversationTagTool,
  setSensorValueTool,
  adjustSensorValueTool,
  simulateEnvironmentalConditionTool,
  resetSensorTool
} from '@/lib/tools/';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('🚀 Chat API route called');
  const { messages }: { messages: UIMessage[] } = await req.json();
  console.log('📨 Messages received:', messages.length);

  try {
    console.log('🛠️ Creating sensor tools...');
    
    console.log('🤖 Starting streamText...');
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      system: `You are AstroFlora AI, a plant biology expert with sensor monitoring tools.

🎯 CRITICAL BEHAVIOR: When users ask about sensor data, you MUST:
1. First call get_sensor_data() to get current readings (returns JSON data)
2. Parse and analyze the JSON data to find the answer to their specific question
3. Give a direct, targeted answer based on the analysis

IMPORTANT: The get_sensor_data tool returns JSON with this structure:
{
  "sensors": [
    {
      "sensor_id": "cultivation_area",
      "temperature": 28.1,
      "humidity": 78.5,
      "co2": 395,
      "pressure": 1011.9,
      "timestamp": "..."
    }
  ]
}

MANDATORY RESPONSE PATTERN:
Question: "what sensor has more humidity?"
Step 1: Call get_sensor_data() to get JSON data
Step 2: Parse JSON and compare humidity values
Step 3: Answer: "The cultivation_area has the highest humidity at 78.5%"

DO NOT show raw JSON to user. Analyze it and give a clear answer.

Available sensors: main_room, greenhouse_01, laboratory, cultivation_area`,
      tools: {
        get_sensor_data: getSensorDataTool,
        analyze_environmental_conditions: analyzeEnvironmentalConditionsTool,
        search_conversations: searchConversationsTool,
        get_conversation_stats: getConversationStatsTool,
        add_conversation_tag: addConversationTagTool,
        set_sensor_value: setSensorValueTool,
        adjust_sensor_value: adjustSensorValueTool,
        simulate_environmental_condition: simulateEnvironmentalConditionTool,
        reset_sensor: resetSensorTool,
      },
      toolChoice: 'auto', // Let model decide when to use tools, but encourage usage
      stopWhen: stepCountIs(5), // Allow enough steps for tool call + analysis + response
      temperature: 0.1, // Very low temperature for consistent, focused behavior
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
      system: `You are AstroFlora AI, an advanced biological intelligence assistant specializing in plant biology, genetics, biotechnology, environmental monitoring, and agricultural sciences.

Note: Sensor tools are currently unavailable. You can still provide general plant care advice and biological expertise.

Always be helpful, accurate, and maintain your biology and environmental expertise focus.`,
    });

    return result.toUIMessageStreamResponse();
  }
}
