import { NextRequest, NextResponse } from 'next/server';
import { initializeMockSensors } from '@/lib/mock-data';

export async function POST(request: NextRequest) {
  try {
    // Initialize the mock sensor data
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