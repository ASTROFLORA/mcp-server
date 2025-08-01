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

// Function to simulate sensor fluctuations
export const simulateSensorFluctuations = () => {
  const sensorIds = sensorDataStore.getSensorIds();
  
  sensorIds.forEach(sensor_id => {
    const currentData = sensorDataStore.get(sensor_id);
    if (!currentData) return;

    // Add small random fluctuations
    const fluctuations: Partial<SensorData> = {};
    
    if (currentData.temperature !== undefined) {
      fluctuations.temperature = Math.round((currentData.temperature + (Math.random() - 0.5) * 2) * 10) / 10;
    }
    
    if (currentData.humidity !== undefined) {
      fluctuations.humidity = Math.round((currentData.humidity + (Math.random() - 0.5) * 5) * 10) / 10;
    }
    
    if (currentData.co2 !== undefined) {
      fluctuations.co2 = Math.round(currentData.co2 + (Math.random() - 0.5) * 20);
    }
    
    if (currentData.pressure !== undefined) {
      fluctuations.pressure = Math.round((currentData.pressure + (Math.random() - 0.5) * 2) * 100) / 100;
    }

    updateMockSensor(sensor_id, fluctuations);
  });
};

// Start simulation interval
let simulationInterval: NodeJS.Timeout | null = null;

export const startSensorSimulation = (intervalMs: number = 10000) => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
  }
  
  simulationInterval = setInterval(simulateSensorFluctuations, intervalMs);
  console.log(`Sensor simulation started with ${intervalMs}ms interval`);
};

export const stopSensorSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('Sensor simulation stopped');
  }
};