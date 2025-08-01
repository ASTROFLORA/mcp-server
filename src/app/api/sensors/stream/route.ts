import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Helper function to get sensor data from list endpoint
      const getSensorData = async () => {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sensors/list`);
          if (response.ok) {
            const data = await response.json();
            return data.sensors || [];
          }
          return [];
        } catch (error) {
          console.error('Error fetching sensor data:', error);
          return [];
        }
      };

      // Send initial sensor data
      const sendInitialData = async () => {
        const sensors = await getSensorData();
        controller.enqueue(`data: ${JSON.stringify({
          type: 'initial_data',
          sensors: sensors
        })}\n\n`);
      };

      // Send initial data immediately
      sendInitialData();

      // Set up periodic updates
      const interval = setInterval(async () => {
        try {
          // Get updated sensor data from list endpoint
          const sensors = await getSensorData();
          
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
