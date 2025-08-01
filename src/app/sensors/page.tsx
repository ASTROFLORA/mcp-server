"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Grid,
  Text,
  VStack,
  HStack,
  Spinner,
  Circle,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import {
  FiThermometer,
  FiDroplet,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";

interface SensorData {
  id: string;
  sensor_id: string;

  temperature?: number;
  humidity?: number;
  co2?: number;
  pressure?: number;
  type?: string;
  last_update?: string;
}


function SensorMetricCard({
  title,
  value,
  unit,
  icon,
  color,
  location,
  isConnected,
}: {
  title: string;
  value: number | undefined;
  unit: string;
  icon: React.ReactNode;
  color: string;
  location: string;
  isConnected: boolean;
}) {
  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      p={6}
      position="relative"
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
    >
      <VStack gap={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {title}
          </Text>
          <Circle size="8px" bg={isConnected ? "green.400" : "gray.400"} />
        </HStack>

        <HStack gap={3} align="center">
          <Box color={color} fontSize="xl">
            {icon}
          </Box>
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            {value !== undefined ? `${value}${unit}` : "--"}
          </Text>
        </HStack>

        <HStack gap={2} align="center">
          <Box w="12px" h="12px" borderRadius="full" bg="orange.400" />
          <Text fontSize="sm" color="gray.600">
            {location}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [connectedSensors, setConnectedSensors] = useState<Set<string>>(
    new Set()
  );
  const [selectedSensorFilter, setSelectedSensorFilter] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);

  const initializeEventSource = useCallback(() => {
    try {
      // Initialize Server-Sent Events connection
      const eventSource = new EventSource('/api/sensors/stream');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'initial_data') {
            const sensorsArray = Array.isArray(data.sensors) ? data.sensors : [];
            setSensors(sensorsArray);
            setLoading(false);
            // Mark all sensors as connected
            const sensorIds = new Set<string>();
            sensorsArray.forEach((s: SensorData) => {
              if (s.sensor_id) {
                sensorIds.add(s.sensor_id);
              }
            });
            setConnectedSensors(sensorIds);
          } else if (data.type === 'sensor_update') {
            const sensorsArray = Array.isArray(data.sensors) ? data.sensors : [];
            setSensors(sensorsArray);
            // Update connected sensors
            const sensorIds = new Set<string>();
            sensorsArray.forEach((s: SensorData) => {
              if (s.sensor_id) {
                sensorIds.add(s.sensor_id);
              }
            });
            setConnectedSensors(sensorIds);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        
        if (eventSource.readyState === EventSource.CLOSED) {
          toaster.create({
            title: "Connection Lost",
            description: "Real-time updates disconnected. Retrying...",
            type: "warning",
            duration: 3000,
          });
          
          // Retry connection after 3 seconds
          setTimeout(() => {
            if (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED) {
              initializeEventSource();
            }
          }, 3000);
        }
      };

    } catch (error) {
      console.error("Failed to initialize SSE:", error);
      setLoading(false);
      toaster.create({
        title: "Connection Error",
        description: "Failed to initialize real-time connection",
        type: "error",
        duration: 3000,
      });
    }
  }, []);



  useEffect(() => {
    // First try to get existing sensor data, then connect to SSE
    const loadSensorData = async () => {
      try {
        // Try to get existing sensor data
        const listResponse = await fetch('/api/sensors/list');
        let sensorsData = [];
        
        if (listResponse.ok) {
          const result = await listResponse.json();
          sensorsData = result.sensors || [];
        }
        
        // If no sensors found, initialize mock data
        if (sensorsData.length === 0) {
          const initResponse = await fetch('/api/sensors/init', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (initResponse.ok) {
            // After initialization, get the sensor data
            const listResponse2 = await fetch('/api/sensors/list');
            if (listResponse2.ok) {
              const result2 = await listResponse2.json();
              sensorsData = result2.sensors || [];
            }
          }
        }
        
        // Set initial sensor data
        if (sensorsData.length > 0) {
          setSensors(sensorsData);
          const sensorIds = new Set<string>();
          sensorsData.forEach((s: SensorData) => {
            if (s.sensor_id) {
              sensorIds.add(s.sensor_id);
            }
          });
          setConnectedSensors(sensorIds);
        }
        
        setLoading(false);
        
        // After loading initial data, connect to SSE for real-time updates
        initializeEventSource();
        
      } catch (error) {
        console.error('Error loading sensor data:', error);
        setLoading(false);
        toaster.create({
          title: "Connection Error",
          description: "Failed to load sensor data",
          type: "error",
          duration: 3000,
        });
      }
    };

    loadSensorData();

    // Cleanup function will be called when component unmounts
    return () => {
      // Close SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [initializeEventSource]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  const getSensorLocation = (sensor_id: string) => {
    const locationMap: { [key: string]: string } = {
      main_room: "Main Room",
      greenhouse_01: "Greenhouse 01",
      laboratory: "Laboratory",
      cultivation_area: "Cultivation Area",
    };
    return locationMap[sensor_id] || sensor_id;
  };

  // Filter sensors based on selected filter
  const sensorsArray = Array.isArray(sensors) ? sensors : [];
  const filteredSensors = selectedSensorFilter === "all" 
    ? sensorsArray 
    : sensorsArray.filter(sensor => sensor.sensor_id === selectedSensorFilter);

  // Collect all sensor data for display
  const allMetrics = filteredSensors.flatMap((sensor) => [
    {
      title: "Temperature",
      value: sensor.temperature,
      unit: "°C",
      icon: <FiThermometer />,
      color: "red.500",
      location: getSensorLocation(sensor.sensor_id),
      isConnected: connectedSensors.has(sensor.sensor_id),
      sensor_id: sensor.sensor_id,
    },
    {
      title: "Humidity",
      value: sensor.humidity,
      unit: "%",
      icon: <FiDroplet />,
      color: "blue.500",
      location: getSensorLocation(sensor.sensor_id),
      isConnected: connectedSensors.has(sensor.sensor_id),
      sensor_id: sensor.sensor_id,
    },
    {
      title: "CO₂",
      value: sensor.co2,
      unit: "ppm",
      icon: <FiActivity />,
      color: "green.500",
      location: getSensorLocation(sensor.sensor_id),
      isConnected: connectedSensors.has(sensor.sensor_id),
      sensor_id: sensor.sensor_id,
    },
    {
      title: "Pressure",
      value: sensor.pressure,
      unit: "hPa",
      icon: <FiBarChart />,
      color: "purple.500",
      location: getSensorLocation(sensor.sensor_id),
      isConnected: connectedSensors.has(sensor.sensor_id),
      sensor_id: sensor.sensor_id,
    },
  ]);

  return (
    <Box p={8} maxWidth="1600px" mx="auto" bg="gray.50" minH="100vh">
      <VStack gap={8} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={1} color="teal.600">
            AstroFlora Antares - Control Center
          </Text>
          <HStack gap={4} align="center" justify="space-between">
            <HStack gap={4} align="center">
              <Circle size="8px" bg={isConnected ? "green.400" : "gray.400"} />
              <Text fontSize="sm" color="gray.600">
                {isConnected ? "Connected • Real-time updates" : "Connecting..."}
              </Text>
            </HStack>
            <HStack gap={3} align="center">
              <Text fontSize="sm" color="gray.600">
                Filter by sensor:
              </Text>
              <select
                value={selectedSensorFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSensorFilter(e.target.value)}
                style={{
                  fontSize: '14px',
                  width: '200px',
                  height: '32px',
                  backgroundColor: 'white',
                  color: '#2D3748',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  outline: 'none',
                  appearance: 'menulist'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#319795';
                  e.target.style.boxShadow = '0 0 0 1px #319795';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All Sensors</option>
                {sensorsArray.map((sensor) => (
                  <option key={sensor.sensor_id} value={sensor.sensor_id}>
                    {getSensorLocation(sensor.sensor_id)}
                  </option>
                ))}
              </select>
            </HStack>
          </HStack>
        </Box>

        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="40vh"
          >
            <Spinner size="xl" color="teal.500" />
          </Box>
        ) : allMetrics.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">
              {selectedSensorFilter === "all" 
                ? "No sensor data available. Initializing sensors..."
                : `No data available for ${getSensorLocation(selectedSensorFilter)}`
              }
            </Text>
          </Box>
        ) : (
          <Box>
            <HStack justify="space-between" align="center" mb={4}>
              <Text fontSize="md" color="gray.600">
                Showing {filteredSensors.length} of {sensorsArray.length} sensor{sensorsArray.length !== 1 ? 's' : ''}
                {selectedSensorFilter !== "all" && ` • ${getSensorLocation(selectedSensorFilter)}`}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {allMetrics.length} metric{allMetrics.length !== 1 ? 's' : ''} displayed
              </Text>
            </HStack>
            
            {selectedSensorFilter === "all" ? (
              // Sectioned view for all sensors
              <VStack gap={8} align="stretch">
                {filteredSensors.map((sensor) => (
                  <Box key={sensor.sensor_id}>
                    <HStack align="center" mb={4}>
                      <Circle size="8px" bg={connectedSensors.has(sensor.sensor_id) ? "green.400" : "gray.400"} />
                      <Text fontSize="lg" fontWeight="bold" color="gray.700">
                        {getSensorLocation(sensor.sensor_id)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        ({sensor.sensor_id})
                      </Text>
                    </HStack>
                    <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={4}>
                      {[
                        {
                          title: "Temperature",
                          value: sensor.temperature,
                          unit: "°C",
                          icon: <FiThermometer />,
                          color: "red.500",
                        },
                        {
                          title: "Humidity",
                          value: sensor.humidity,
                          unit: "%",
                          icon: <FiDroplet />,
                          color: "blue.500",
                        },
                        {
                          title: "CO₂",
                          value: sensor.co2,
                          unit: "ppm",
                          icon: <FiActivity />,
                          color: "green.500",
                        },
                        {
                          title: "Pressure",
                          value: sensor.pressure,
                          unit: "hPa",
                          icon: <FiBarChart />,
                          color: "purple.500",
                        },
                      ].map((metric, index) => (
                        <SensorMetricCard
                          key={`${sensor.sensor_id}-${metric.title}-${index}`}
                          title={metric.title}
                          value={metric.value}
                          unit={metric.unit}
                          icon={metric.icon}
                          color={metric.color}
                          location={getSensorLocation(sensor.sensor_id)}
                          isConnected={connectedSensors.has(sensor.sensor_id)}
                        />
                      ))}
                    </Grid>
                  </Box>
                ))}
              </VStack>
            ) : (
              // Single sensor view
              <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
                {allMetrics.map((metric, index) => (
                  <SensorMetricCard
                    key={`${metric.sensor_id}-${metric.title}-${index}`}
                    title={metric.title}
                    value={metric.value}
                    unit={metric.unit}
                    icon={metric.icon}
                    color={metric.color}
                    location={metric.location}
                    isConnected={metric.isConnected}
                  />
                ))}
              </Grid>
            )}
          </Box>
        )}

      </VStack>
    </Box>
  );
}
