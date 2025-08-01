import { NextRequest, NextResponse } from 'next/server';
import { sensorDataStore } from '@/lib/stores/sensor-store';

export async function GET(
  request: NextRequest,
  { params }: { params: { sensor_id: string } }
) {
  try {
    const { sensor_id } = params;
    const sensorData = sensorDataStore.get(sensor_id);
    
    if (!sensorData) {
      return NextResponse.json(
        { error: 'Sensor not found or no data available' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: sensor_id,
      sensor_id: sensorData.sensor_id,
      timestamp: sensorData.timestamp,
      temperature: sensorData.temperature,
      humidity: sensorData.humidity,
      co2: sensorData.co2,
      pressure: sensorData.pressure,
    });
  } catch (error) {
    console.error('Sensor fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}