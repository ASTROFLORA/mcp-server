import { sensorDataStore, type SensorData } from '@/lib/stores/sensor-store';

// Mock sensor data initialization
export const initializeMockSensors = () => {
  const mockSensors: SensorData[] = [
    {
      sensor_id: 'main_room',
      timestamp: new Date().toISOString(),
      temperature: 24.5,
      humidity: 65.2,
      co2: 420,
      pressure: 1013.25,
    },
    {
      sensor_id: 'greenhouse_01',
      timestamp: new Date().toISOString(),
      temperature: 26.8,
      humidity: 72.1,
      co2: 380,
      pressure: 1012.8,
    },
    {
      sensor_id: 'laboratory',
      timestamp: new Date().toISOString(),
      temperature: 22.3,
      humidity: 58.9,
      co2: 450,
      pressure: 1014.1,
    },
    {
      sensor_id: 'cultivation_area',
      timestamp: new Date().toISOString(),
      temperature: 28.1,
      humidity: 78.5,
      co2: 395,
      pressure: 1011.9,
    },
  ];

  // Add mock sensors to the store
  mockSensors.forEach(sensor => {
    sensorDataStore.set(sensor.sensor_id, sensor);
  });

  console.log('Mock sensors initialized:', mockSensors.length);
};

// Function to update mock sensor values (for chatbot manipulation)
export const updateMockSensor = (
  sensor_id: string,
  updates: Partial<Omit<SensorData, 'sensor_id' | 'timestamp'>>
): boolean => {
  const currentData = sensorDataStore.get(sensor_id);
  if (!currentData) {
    return false;
  }

  const updatedData: SensorData = {
    ...currentData,
    ...updates,
    timestamp: new Date().toISOString(),
  };

  sensorDataStore.set(sensor_id, updatedData);
  return true;
};