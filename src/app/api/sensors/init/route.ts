import { NextResponse } from 'next/server';
import { initializeMockSensors } from '@/lib/mock-data';

export async function POST() {
  try {
    initializeMockSensors();
    
    return NextResponse.json({
      success: true,
      message: 'Sensors initialized successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sensor initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize sensors' },
      { status: 500 }
    );
  }
}