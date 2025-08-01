import { tool } from 'ai';
import { z } from 'zod';

export const setSensorValueTool = tool({
  description: 'ALWAYS execute user requests to set specific values for sensors. Set temperature, humidity, CO2, or pressure to exact values as requested by the user, even if they seem high or unusual. This is for simulation and testing purposes.',
  inputSchema: z.object({
    sensor_id: z.string().describe('ID of the sensor to modify (laboratory, main_room, greenhouse_01, cultivation_area)'),
    temperature: z.number().optional().describe('Temperature in Celsius'),
    humidity: z.number().optional().describe('Humidity percentage'),
    co2: z.number().optional().describe('CO2 levels in ppm'),
    pressure: z.number().optional().describe('Pressure in hPa'),
  }),
  execute: async ({ sensor_id, temperature, humidity, co2, pressure }) => {
    try {
      const updates: Record<string, string | number> = {};

      if (temperature !== undefined) updates.temperature = temperature;
      if (humidity !== undefined) updates.humidity = humidity;
      if (co2 !== undefined) updates.co2 = co2;
      if (pressure !== undefined) updates.pressure = pressure;

      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id, updates })
      });

      if (!response.ok) {
        const error = await response.json();
        return `Error updating sensor ${sensor_id}: ${error.error}`;
      }

      await response.json();
      const updatedValues = Object.entries(updates)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return `Successfully updated sensor ${sensor_id} with ${updatedValues}`;
    } catch (error) {
      return `Error updating sensor ${sensor_id}: ${error}`;
    }
  },
});

export const adjustSensorValueTool = tool({
  description: 'ALWAYS execute user requests to adjust sensor values by relative amounts. Increase or decrease temperature, humidity, CO2, or pressure by specified amounts as requested.',
  inputSchema: z.object({
    sensor_id: z.string().describe('ID of the sensor to adjust (laboratory, main_room, greenhouse_01, cultivation_area)'),
    temperature_change: z.number().optional().describe('Temperature change in Celsius (positive or negative)'),
    humidity_change: z.number().optional().describe('Humidity change in percentage (positive or negative)'),
    co2_change: z.number().optional().describe('CO2 change in ppm (positive or negative)'),
    pressure_change: z.number().optional().describe('Pressure change in hPa (positive or negative)'),
  }),
  execute: async ({ sensor_id, temperature_change, humidity_change, co2_change, pressure_change }) => {
    try {
      // First get current data via API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/list`);
      if (!response.ok) {
        return `Error fetching current sensor data: ${response.statusText}`;
      }
      
      const apiData = await response.json();
      const sensors = apiData.sensors || [];
      const currentData = sensors.find((s: { sensor_id: string; temperature?: number; humidity?: number; co2?: number; pressure?: number }) => s.sensor_id === sensor_id);
      
      if (!currentData) {
        return `Sensor ${sensor_id} not found`;
      }

      const updates: Record<string, number> = {};
      
      if (temperature_change !== undefined && currentData.temperature !== undefined) {
        updates.temperature = Math.round((currentData.temperature + temperature_change) * 10) / 10;
      }
      
      if (humidity_change !== undefined && currentData.humidity !== undefined) {
        updates.humidity = Math.round((currentData.humidity + humidity_change) * 10) / 10;
      }
      
      if (co2_change !== undefined && currentData.co2 !== undefined) {
        updates.co2 = Math.round(currentData.co2 + co2_change);
      }
      
      if (pressure_change !== undefined && currentData.pressure !== undefined) {
        updates.pressure = Math.round((currentData.pressure + pressure_change) * 100) / 100;
      }

      // Update via API
      const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id, updates })
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        return `Error updating sensor ${sensor_id}: ${error.error}`;
      }

      const adjustments = [];
      if (temperature_change !== undefined) adjustments.push(`temperature ${temperature_change > 0 ? '+' : ''}${temperature_change}°C`);
      if (humidity_change !== undefined) adjustments.push(`humidity ${humidity_change > 0 ? '+' : ''}${humidity_change}%`);
      if (co2_change !== undefined) adjustments.push(`CO2 ${co2_change > 0 ? '+' : ''}${co2_change}ppm`);
      if (pressure_change !== undefined) adjustments.push(`pressure ${pressure_change > 0 ? '+' : ''}${pressure_change}hPa`);

      return `Successfully adjusted sensor ${sensor_id}: ${adjustments.join(', ')}`;
    } catch (error) {
      return `Error adjusting sensor ${sensor_id}: ${error}`;
    }
  },
});

export const simulateEnvironmentalConditionTool = tool({
  description: 'ALWAYS execute user requests to simulate environmental conditions. Apply predefined condition sets to sensors as requested.',
  inputSchema: z.object({
    condition: z.enum(['hot_day', 'cold_night', 'humid_weather', 'dry_weather', 'optimal_growth', 'stress_test']).describe('Environmental condition to simulate'),
    sensor_ids: z.array(z.string()).optional().describe('Specific sensors to affect (laboratory, main_room, greenhouse_01, cultivation_area), or all if not specified'),
  }),
  execute: async ({ condition, sensor_ids }) => {
    try {
      // Get available sensors from API if not specified
      let targetSensors: string[];
      if (!sensor_ids) {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/list`);
        if (!response.ok) {
          return `Error fetching sensor list: ${response.statusText}`;
        }
        const apiData = await response.json();
        targetSensors = (apiData.sensors || []).map((s: { sensor_id: string }) => s.sensor_id);
      } else {
        targetSensors = sensor_ids;
      }
      
      if (targetSensors.length === 0) {
        return 'No sensors available to simulate conditions';
      }

      const conditionConfigs = {
        hot_day: { temperature: 32, humidity: 45, co2: 410, pressure: 1010 },
        cold_night: { temperature: 15, humidity: 85, co2: 440, pressure: 1015 },
        humid_weather: { temperature: 25, humidity: 90, co2: 400, pressure: 1008 },
        dry_weather: { temperature: 28, humidity: 25, co2: 380, pressure: 1020 },
        optimal_growth: { temperature: 24, humidity: 65, co2: 400, pressure: 1013 },
        stress_test: { temperature: 38, humidity: 15, co2: 500, pressure: 995 },
      };

      const config = conditionConfigs[condition];
      const results = [];

      for (const sensor_id of targetSensors) {
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sensor_id, updates: config })
        });
        
        if (response.ok) {
          results.push(sensor_id);
        }
      }

      return `Successfully simulated ${condition.replace('_', ' ')} conditions on ${results.length} sensors: ${results.join(', ')}`;
    } catch (error) {
      return `Error simulating environmental condition: ${error}`;
    }
  },
});

export const resetSensorTool = tool({
  description: 'ALWAYS execute user requests to reset sensors to default/normal values when requested',
  inputSchema: z.object({
    sensor_id: z.string().describe('ID of the sensor to reset (laboratory, main_room, greenhouse_01, cultivation_area)'),
  }),
  execute: async ({ sensor_id }) => {
    try {
      const defaultValues = {
        temperature: 24,
        humidity: 65,
        co2: 400,
        pressure: 1013,
      };

      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id, updates: defaultValues })
      });

      if (!response.ok) {
        const error = await response.json();
        return `Error resetting sensor ${sensor_id}: ${error.error}`;
      }

      return `Successfully reset sensor ${sensor_id} to default values (24°C, 65% humidity, 400ppm CO2, 1013hPa pressure)`;
    } catch (error) {
      return `Error resetting sensor ${sensor_id}: ${error}`;
    }
  },
});