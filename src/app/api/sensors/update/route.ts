import { NextRequest, NextResponse } from 'next/server';
import { updateMockSensor, initializeMockSensors } from '@/lib/mock-data';
import { sensorDataStore } from '@/lib/stores/sensor-store';

export async function POST(request: NextRequest) {
  try {
    const { sensor_id, updates } = await request.json();
    
    if (!sensor_id) {
      return NextResponse.json(
        { error: 'sensor_id is required' },
        { status: 400 }
      );
    }
    
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'updates object is required' },
        { status: 400 }
      );
    }
    
    // Ensure sensors are initialized if store is empty
    if (sensorDataStore.getAllSensors().size === 0) {
      initializeMockSensors();
    }
    
    const success = updateMockSensor(sensor_id, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: `Sensor ${sensor_id} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated sensor ${sensor_id}`,
      sensor_id,
      updates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sensor update error:', error);
    return NextResponse.json(
      { error: 'Failed to update sensor' },
      { status: 500 }
    );
  }
}