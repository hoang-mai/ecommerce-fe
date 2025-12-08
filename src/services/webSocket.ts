import { Client, IFrame, IMessage, StompSubscription } from '@stomp/stompjs';
import {ReqPrivateMessageDTO} from "@/types/interface";

export interface WebSocketConfig {
  debug?: boolean;
  reconnectDelay?: number;
  headers?: Record<string, string>;
  onConnect?: (frame: IFrame) => void;
  onError?: (frame: IFrame) => void;
  onDisconnect?: () => void;
}

export type MessageCallback = (data: any) => void;


class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, MessageCallback> = new Map();
  private activeSubscriptions: Map<string, StompSubscription> = new Map();

  initialize(url: string, config: WebSocketConfig = {}): void {

    if (typeof window === 'undefined') return;

    this.client = new Client({
      brokerURL: url,
      connectHeaders: config.headers || {},

      debug: (str: string) => {
        if (config.debug) console.log('STOMP:', str);
      },

      reconnectDelay: config.reconnectDelay || 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: (frame: IFrame) => {
        this.connected = true;

        if (config.onConnect) config.onConnect(frame);

      },

      onStompError: (frame: IFrame) => {
        if (config.onError) config.onError(frame);
      },

      onWebSocketClose: () => {
        this.connected = false;
      },

      onDisconnect: () => {
        this.connected = false;
        if (config.onDisconnect) config.onDisconnect();
      }
    });

    this.client.activate();
  }

  subscribe(destination: string, callback: MessageCallback): StompSubscription | undefined {
    this.subscriptions.set(destination, callback);

    if (this.client && this.connected) {
      const subscription = this.client.subscribe(destination, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          callback(body);
        } catch {
          callback(message.body);
        }
      });

      this.activeSubscriptions.set(destination, subscription);
      return subscription;
    }

    return undefined;
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((callback, destination) => {
      if (this.client && this.connected) {
        const subscription = this.client.subscribe(destination, (message: IMessage) => {
          try {
            const body = JSON.parse(message.body);
            callback(body);
          } catch (e) {
            callback(message.body);
          }
        });

        this.activeSubscriptions.set(destination, subscription);
      }
    });
  }

  unsubscribe(destination: string): void {
    const subscription = this.activeSubscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.activeSubscriptions.delete(destination);
    }
    this.subscriptions.delete(destination);
  }

  send(destination: string, body: ReqPrivateMessageDTO): void {
    if (this.client && this.connected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(body)
      });
    } else {
      console.warn('WebSocket chưa kết nối, không thể gửi message');
    }
  }

  disconnect(): void {
    if (this.client) {
      this.activeSubscriptions.forEach(sub => sub.unsubscribe());
      this.activeSubscriptions.clear();
      this.subscriptions.clear();
      this.client.deactivate();
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();