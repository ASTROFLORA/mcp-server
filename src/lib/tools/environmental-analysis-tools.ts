import { tool } from 'ai';
import { z } from 'zod';
import { sensorDataStore } from '@/lib/stores/sensor-store';

const ENVIRONMENTAL_THRESHOLDS = {
  TEMP_MIN: 18,
  TEMP_MAX: 28,
  HUMIDITY_MIN: 40,
  HUMIDITY_MAX: 80,
  CO2_MIN: 300,
  CO2_MAX: 1200,
} as const;

export const analyzeEnvironmentalConditionsTool = tool({
  description: 'Analyze current environmental conditions and provide plant care recommendations',
  inputSchema: z.object({
    plant_type: z.string().optional().describe('Type of plant being grown (optional)'),
  }),
  execute: async ({ plant_type }) => {
    try {
      const allSensors = Array.from(sensorDataStore.entries());
      if (allSensors.length === 0) {
        return 'No sensor data available for analysis';
      }

      let analysis = 'Environmental Analysis:\n\n';
      
      allSensors.forEach(([id, data]) => {
        analysis += `Sensor ${id} Analysis:\n`;
        
        if (data.temperature !== undefined) {
          if (data.temperature < ENVIRONMENTAL_THRESHOLDS.TEMP_MIN) {
            analysis += `Temperature (${data.temperature} C): Too cold - may stress plants\n`;
          } else if (data.temperature > ENVIRONMENTAL_THRESHOLDS.TEMP_MAX) {
            analysis += `Temperature (${data.temperature} C): Too hot - may cause heat stress\n`;
          } else {
            analysis += `Temperature (${data.temperature} C): Within optimal range\n`;
          }
        }
        
        if (data.humidity !== undefined) {
          if (data.humidity < ENVIRONMENTAL_THRESHOLDS.HUMIDITY_MIN) {
            analysis += `Humidity (${data.humidity}%): Too dry - may cause leaf stress\n`;
          } else if (data.humidity > ENVIRONMENTAL_THRESHOLDS.HUMIDITY_MAX) {
            analysis += `Humidity (${data.humidity}%): Too humid - risk of fungal issues\n`;
          } else {
            analysis += `Humidity (${data.humidity}%): Good level\n`;
          }
        }
        
        if (data.co2 !== undefined) {
          if (data.co2 < ENVIRONMENTAL_THRESHOLDS.CO2_MIN) {
            analysis += `CO2 (${data.co2} ppm): Low - may limit photosynthesis\n`;
          } else if (data.co2 > ENVIRONMENTAL_THRESHOLDS.CO2_MAX) {
            analysis += `CO2 (${data.co2} ppm): Very high - may stress plants\n`;
          } else {
            analysis += `CO2 (${data.co2} ppm): Good for photosynthesis\n`;
          }
        }
        
        analysis += '\n';
      });
      
      if (plant_type) {
        analysis += `Specific recommendations for ${plant_type}:\n`;
        analysis += `Please adjust environmental conditions based on ${plant_type} specific requirements.\n`;
      }
      
      return analysis;
    } catch (error) {
      return `Error analyzing conditions: ${error}`;
    }
  },
});