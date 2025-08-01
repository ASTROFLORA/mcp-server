import { NextRequest } from 'next/server';
import { sensorDataStore } from '@/lib/stores/sensor-store';
import { simulateSensorFluctuations } from '@/lib/mock-data';

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial sensor data
      const initialData = sensorDataStore.getAllSensors();
      controller.enqueue(`data: ${JSON.stringify({
        type: 'initial_data',
        sensors: initialData
      })}\n\n`);

      // Set up periodic updates
      const interval = setInterval(() => {
        try {
          // Simulate sensor fluctuations
          simulateSensorFluctuations();
          
          // Get updated sensor data
          const sensors = sensorDataStore.getAllSensors();
          
          // Send updated data
          controller.enqueue(`data: ${JSON.stringify({
            type: 'sensor_update',
            sensors: sensors,
            timestamp: new Date().toISOString()
          })}\n\n`);
        } catch (error) {
          console.error('Error in sensor stream:', error);
          controller.error(error);
        }
      }, 2000); // Update every 2 seconds

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
