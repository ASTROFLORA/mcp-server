import { NextResponse } from 'next/server';
import { sensorDataStore } from '@/lib/stores/sensor-store';

export async function GET() {
  try {
    const sensors = Array.from(sensorDataStore.entries()).map(([sensor_id, data]) => ({
      id: sensor_id,
      sensor_id: data.sensor_id,
      timestamp: data.timestamp,
      temperature: data.temperature,
      humidity: data.humidity,
      co2: data.co2,
      pressure: data.pressure,
      status: 'active', // You can implement actual status logic
      last_update: data.timestamp,
    }));
    
    return NextResponse.json({
      sensors,
      count: sensors.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sensor list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}