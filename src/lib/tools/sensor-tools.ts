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
      console.log('Available sensor IDs:', sensors.map((s: any) => s.sensor_id));
      
      if (sensor_id) {
        const sensor = sensors.find((s: any) => s.sensor_id === sensor_id);
        if (!sensor) {
          return `Sensor ${sensor_id} not found or has no data. Available sensors: ${sensors.map((s: any) => s.sensor_id).join(', ')}`;
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
          return 'No sensor data available';
        }
        
        const sensorsData = sensors.map((sensor: any) => {
          return [
            `Sensor ${sensor.sensor_id}:`,
            `  Temperature: ${sensor.temperature !== undefined ? `${sensor.temperature}°C` : 'Not available'}`,
            `  Humidity: ${sensor.humidity !== undefined ? `${sensor.humidity}%` : 'Not available'}`,
            `  CO2: ${sensor.co2 !== undefined ? `${sensor.co2} ppm` : 'Not available'}`,
            `  Pressure: ${sensor.pressure !== undefined ? `${sensor.pressure} hPa` : 'Not available'}`,
            `  Last Update: ${new Date(sensor.timestamp).toLocaleString()}`
          ].join('\n');
        }).join('\n\n');
        
        return `All Sensors Data:\n\n${sensorsData}`;
      }
    } catch (error) {
      console.error('Sensor tool error:', error);
      return `Error fetching sensor data: ${error}`;
    }
  },
});