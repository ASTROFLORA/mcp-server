import { NextRequest, NextResponse } from 'next/server';
import { sensorDataStore, SensorDataSchema, type SensorData } from '@/lib/stores/sensor-store';
import { eventEmitter } from '@/lib/event-emitter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = SensorDataSchema.parse(body);
    
    // Check if this is a new sensor
    const isNewSensor = !sensorDataStore.has(data.sensor_id);
    
    // Store the sensor data (this will also notify subscribers)
    sensorDataStore.set(data.sensor_id, data);
    
    // Emit sensor data update event
    eventEmitter.emitSensorDataUpdate(data);
    
    // If this is the first data from this sensor, emit connected event
    if (isNewSensor) {
      eventEmitter.emitSensorConnected(data.sensor_id);
    }
    
    // Check for alerts
    checkSensorAlerts(data);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Sensor ingestion error:', error);
    return NextResponse.json(
      { error: 'Invalid sensor data' },
      { status: 400 }
    );
  }
}

function checkSensorAlerts(data: SensorData) {
  const alerts = [];
  
  if (data.temperature !== undefined) {
    if (data.temperature < 15) {
      alerts.push(`Critical low temperature: ${data.temperature}°C on sensor ${data.sensor_id}`);
    } else if (data.temperature > 35) {
      alerts.push(`Critical high temperature: ${data.temperature}°C on sensor ${data.sensor_id}`);
    }
  }
  
  if (data.humidity !== undefined) {
    if (data.humidity < 30) {
      alerts.push(`Low humidity warning: ${data.humidity}% on sensor ${data.sensor_id}`);
    } else if (data.humidity > 90) {
      alerts.push(`High humidity warning: ${data.humidity}% on sensor ${data.sensor_id}`);
    }
  }
  
  if (data.co2 !== undefined) {
    if (data.co2 > 1500) {
      alerts.push(`High CO2 levels: ${data.co2} ppm on sensor ${data.sensor_id}`);
    }
  }
  
  alerts.forEach(alert => {
    eventEmitter.emitSystemAlert('warning', alert, data);
  });
}

// Export store for external access
export { sensorDataStore };