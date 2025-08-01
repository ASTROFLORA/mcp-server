import { tool } from 'ai';
import { z } from 'zod';

export const getSensorDataTool = tool({
  description: 'Get current readings from a specific sensor or all sensors',
  inputSchema: z.object({
    sensor_id: z.string().optional().describe('Specific sensor ID (main_room, greenhouse_01, laboratory, cultivation_area) to get data from, or omit for all sensors'),
  }),
  execute: async ({ sensor_id }) => {
    try {
      console.log(`Fetching sensor data for: ${sensor_id || 'all sensors'}`);
      
      // Ensure sensors are initialized first
      const initResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/init`, {
        method: 'POST'
      });
      
      if (!initResponse.ok) {
        console.log('Sensor initialization failed, continuing anyway...');
      }
      
      // Fetch sensor data from API
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/list`);
      
      if (!response.ok) {
        return `Error fetching sensor data: ${response.status} ${response.statusText}`;
      }
      
      const apiData = await response.json();
      const sensors = apiData.sensors || [];
      
      console.log(`Found ${sensors.length} sensors from API`);
      console.log('Available sensor IDs:', sensors.map((s: { sensor_id: string }) => s.sensor_id));

      if (sensor_id) {
        const sensor = sensors.find((s: { sensor_id: string }) => s.sensor_id === sensor_id);
        if (!sensor) {
          return `Sensor ${sensor_id} not found or has no data. Available sensors: ${sensors.map((s: { sensor_id: string }) => s.sensor_id).join(', ')}`;
        }
        
        const sensorInfo = [
          `Sensor ${sensor_id} Data:`,
          `Temperature: ${sensor.temperature !== undefined ? `${sensor.temperature}°C` : 'Not available'}`,
          `Humidity: ${sensor.humidity !== undefined ? `${sensor.humidity}%` : 'Not available'}`,
          `CO2: ${sensor.co2 !== undefined ? `${sensor.co2} ppm` : 'Not available'}`,
          `Pressure: ${sensor.pressure !== undefined ? `${sensor.pressure} hPa` : 'Not available'}`,
          `Last Update: ${new Date(sensor.timestamp).toLocaleString()}`
        ].join('\n');
        
        return sensorInfo;
      } else {
        if (sensors.length === 0) {
          return JSON.stringify({ error: 'No sensor data available' });
        }

        // Return structured JSON data for analysis
        const sensorData = sensors.map((sensor: { sensor_id: string; temperature?: number; humidity?: number; co2?: number; pressure?: number; timestamp: string }) => ({
          sensor_id: sensor.sensor_id,
          temperature: sensor.temperature,
          humidity: sensor.humidity,
          co2: sensor.co2,
          pressure: sensor.pressure,
          timestamp: sensor.timestamp
        }));
        
        return JSON.stringify({
          sensors: sensorData,
          count: sensorData.length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Sensor tool error:', error);
      return `Error fetching sensor data: ${error}`;
    }
  },
});