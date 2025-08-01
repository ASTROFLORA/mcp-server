import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { z } from 'zod';
import { sensorDataStore } from '@/lib/stores/sensor-store';
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
} from '@/lib/tools/index';
import { conversationStorage } from '@/lib/conversation-storage';
import { eventEmitter } from '@/lib/event-emitter';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log('🚀 Chat API route called');
  const { messages, context }: { messages: UIMessage[], context?: any } = await req.json();
  console.log('📨 Messages received:', messages.length);

  try {
    console.log('🛠️ Creating sensor tools...');
    
    // Prepare sensor context for the AI
    const sensorContext = context ? `\n\nCurrent sensor data:\n${JSON.stringify(context, null, 2)}` : '';
    
    console.log('🤖 Starting streamText...');
    const result = streamText({
      model: openai('gpt-4o'),
      messages: convertToModelMessages(messages),
      system: `You are AstroFlora AI, an advanced biological intelligence assistant specializing in plant biology, genetics, biotechnology, environmental monitoring, and agricultural sciences.

You have access to comprehensive sensor monitoring and manipulation tools for the Astroflora Antares Control Central system. You can:

MONITORING TOOLS:
- Get current sensor readings (temperature, humidity, CO2, pressure) from multiple locations
- Analyze environmental conditions for plant health
- Search conversation history for past sensor discussions
- Generate analytics and insights

SENSOR MANIPULATION TOOLS:
- Set specific sensor values (temperature, humidity, CO2, pressure)
- Adjust sensor values by relative amounts (increase/decrease)
- Simulate environmental conditions (hot_day, cold_night, humid_weather, dry_weather, optimal_growth, stress_test)
- Reset sensors to default values

AVAILABLE SENSORS:
- main_room (Main Room)
- greenhouse_01 (Greenhouse 01) 
- laboratory (Laboratory)
- cultivation_area (Cultivation Area)

When users ask to modify environmental conditions, use the appropriate manipulation tools. Always explain what you're doing and provide scientific context for environmental changes.

Always provide scientific, accurate responses focused on plant biology and environmental optimization.${sensorContext}`,
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
