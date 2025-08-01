import { z } from 'zod';

export const SensorDataSchema = z.object({
  sensor_id: z.string(),
  timestamp: z.string().datetime(),
  temperature: z.number().optional(),
  humidity: z.number().optional(),
  co2: z.number().optional(),
  pressure: z.number().optional(),
});

export type SensorData = z.infer<typeof SensorDataSchema>;

export interface SensorSubscriber {
  id: string;
  callback: (data: SensorData) => void;
  sensor_id?: string;
  created_at: Date;
}

class SensorDataStore {
  private store = new Map<string, SensorData>();
  private subscribers = new Map<string, Set<SensorSubscriber>>();
  private globalSubscribers = new Set<SensorSubscriber>();

  // Store operations
  set(sensor_id: string, data: SensorData): void {
    this.store.set(sensor_id, data);
    this.notifySubscribers(sensor_id, data);
  }

  get(sensor_id: string): SensorData | undefined {
    return this.store.get(sensor_id);
  }

  has(sensor_id: string): boolean {
    return this.store.has(sensor_id);
  }

  delete(sensor_id: string): boolean {
    this.store.delete(sensor_id);
    this.subscribers.delete(sensor_id);
    return true;
  }

  getAllSensors(): Map<string, SensorData> {
    return new Map(this.store);
  }

  getSensorIds(): string[] {
    return Array.from(this.store.keys());
  }

  entries(): IterableIterator<[string, SensorData]> {
    return this.store.entries();
  }

  clear(): void {
    this.store.clear();
    this.subscribers.clear();
    this.globalSubscribers.clear();
  }

  // Subscription operations
  subscribe(
    callback: (data: SensorData) => void,
    sensor_id?: string,
    subscriber_id?: string
  ): string {
    const id = subscriber_id || this.generateId();
    const subscriber: SensorSubscriber = {
      id,
      callback,
      sensor_id,
      created_at: new Date(),
    };

    if (sensor_id) {
      // Subscribe to specific sensor
      if (!this.subscribers.has(sensor_id)) {
        this.subscribers.set(sensor_id, new Set());
      }
      this.subscribers.get(sensor_id)!.add(subscriber);
    } else {
      // Subscribe to all sensors
      this.globalSubscribers.add(subscriber);
    }

    return id;
  }

  unsubscribe(subscriber_id: string, sensor_id?: string): boolean {
    if (sensor_id) {
      const sensorSubscribers = this.subscribers.get(sensor_id);
      if (sensorSubscribers) {
        for (const subscriber of sensorSubscribers) {
          if (subscriber.id === subscriber_id) {
            sensorSubscribers.delete(subscriber);
            return true;
          }
        }
      }
    } else {
      // Remove from global subscribers
      for (const subscriber of this.globalSubscribers) {
        if (subscriber.id === subscriber_id) {
          this.globalSubscribers.delete(subscriber);
          return true;
        }
      }

      // Also check all sensor-specific subscriptions
      for (const [, subscribers] of this.subscribers) {
        for (const subscriber of subscribers) {
          if (subscriber.id === subscriber_id) {
            subscribers.delete(subscriber);
            return true;
          }
        }
      }
    }

    return false;
  }

  private notifySubscribers(sensor_id: string, data: SensorData): void {
    // Notify sensor-specific subscribers
    const sensorSubscribers = this.subscribers.get(sensor_id);
    if (sensorSubscribers) {
      sensorSubscribers.forEach(subscriber => {
        try {
          subscriber.callback(data);
        } catch (error) {
          console.error(`Error in sensor subscriber ${subscriber.id}:`, error);
        }
      });
    }

    // Notify global subscribers
    this.globalSubscribers.forEach(subscriber => {
      try {
        subscriber.callback(data);
      } catch (error) {
        console.error(`Error in global subscriber ${subscriber.id}:`, error);
      }
    });
  }

  // Utility methods
  private generateId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getSubscriptionStats(): {
    total_subscribers: number;
    sensor_specific_subscriptions: { [sensor_id: string]: number };
    global_subscriptions: number;
  } {
    const sensor_specific_subscriptions: { [sensor_id: string]: number } = {};
    
    this.subscribers.forEach((subscribers, sensor_id) => {
      sensor_specific_subscriptions[sensor_id] = subscribers.size;
    });

    return {
      total_subscribers: Array.from(this.subscribers.values()).reduce(
        (sum, subscribers) => sum + subscribers.size, 
        this.globalSubscribers.size
      ),
      sensor_specific_subscriptions,
      global_subscriptions: this.globalSubscribers.size,
    };
  }

  // Health check methods
  getStoreStats(): {
    total_sensors: number;
    sensors_with_recent_data: number;
    oldest_data_age_minutes: number;
    newest_data_age_minutes: number;
  } {
    const now = new Date();
    const sensors = Array.from(this.store.values());
    
    if (sensors.length === 0) {
      return {
        total_sensors: 0,
        sensors_with_recent_data: 0,
        oldest_data_age_minutes: 0,
        newest_data_age_minutes: 0,
      };
    }

    const timestamps = sensors.map(sensor => new Date(sensor.timestamp));
    const ages = timestamps.map(ts => (now.getTime() - ts.getTime()) / (1000 * 60)); // minutes
    
    const recentThreshold = 10; // 10 minutes
    const sensorsWithRecentData = ages.filter(age => age <= recentThreshold).length;

    return {
      total_sensors: sensors.length,
      sensors_with_recent_data: sensorsWithRecentData,
      oldest_data_age_minutes: Math.max(...ages),
      newest_data_age_minutes: Math.min(...ages),
    };
  }
}

// Singleton instance
export const sensorDataStore = new SensorDataStore();

// Export store class for testing or multiple instances if needed
export { SensorDataStore };