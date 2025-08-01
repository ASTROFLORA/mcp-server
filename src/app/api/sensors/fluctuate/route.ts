import { NextResponse } from 'next/server';
import { simulateSensorFluctuations } from '@/lib/mock-data';

export async function POST() {
  try {
    // Apply small fluctuations to all sensors
    simulateSensorFluctuations();
    
    return NextResponse.json({
      success: true,
      message: 'Sensor fluctuations applied',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Sensor fluctuation error:', error);
    return NextResponse.json(
      { error: 'Failed to apply sensor fluctuations' },
      { status: 500 }
    );
  }
}
