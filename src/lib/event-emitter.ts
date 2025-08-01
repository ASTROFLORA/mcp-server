import { EventEmitter } from 'events';

interface SensorDataEvent {
  sensor_id: string;
  timestamp: string;
  temperature?: number;
  humidity?: number;
  co2?: number;
  pressure?: number;
}

interface ChatEvent {
  conversation_id: string;
  message: string;
  role: 'user' | 'assistant';
  timestamp: string;
  context?: any;
}

class AstroFloraEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Allow more listeners for multiple components
  }

  // Sensor-related events
  emitSensorDataUpdate(data: SensorDataEvent) {
    this.emit('sensor:data:update', data);
    this.emit(`sensor:${data.sensor_id}:update`, data);
  }

  emitSensorConnected(sensor_id: string) {
    this.emit('sensor:connected', { sensor_id, timestamp: new Date().toISOString() });
  }

  emitSensorDisconnected(sensor_id: string) {
    this.emit('sensor:disconnected', { sensor_id, timestamp: new Date().toISOString() });
  }

  // Chat-related events
  emitChatMessage(data: ChatEvent) {
    this.emit('chat:message', data);
    this.emit(`chat:${data.conversation_id}:message`, data);
  }

  emitConversationStart(conversation_id: string) {
    this.emit('conversation:start', { conversation_id, timestamp: new Date().toISOString() });
  }

  emitConversationEnd(conversation_id: string) {
    this.emit('conversation:end', { conversation_id, timestamp: new Date().toISOString() });
  }

  // System events
  emitSystemAlert(level: 'info' | 'warning' | 'error', message: string, data?: any) {
    this.emit('system:alert', { level, message, data, timestamp: new Date().toISOString() });
  }

  // Convenience methods for subscribing
  onSensorDataUpdate(callback: (data: SensorDataEvent) => void) {
    this.on('sensor:data:update', callback);
    return this;
  }

  onSensorUpdate(sensor_id: string, callback: (data: SensorDataEvent) => void) {
    this.on(`sensor:${sensor_id}:update`, callback);
    return this;
  }

  onChatMessage(callback: (data: ChatEvent) => void) {
    this.on('chat:message', callback);
    return this;
  }

  onSystemAlert(callback: (data: any) => void) {
    this.on('system:alert', callback);
    return this;
  }
}

// Singleton instance
export const eventEmitter = new AstroFloraEventEmitter();

// Export types
export type { SensorDataEvent, ChatEvent };