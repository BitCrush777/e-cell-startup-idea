import { Message, RoomEvent, Participant } from '@/types';

export type RealtimeListener = (event: RoomEvent) => void;

export class RealtimeClient {
  private roomCode: string;
  private participant: Participant;
  private ws: WebSocket | null = null;
  private listeners: RealtimeListener[] = [];
  private isExplicitlyClosed = false;
  private isExpired = false;
  private reconnectAttempts = 0;
  private reconnectTimeout: any = null;
  private pingInterval: any = null;
  private connectionStatus: 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'expired' = 'disconnected';

  constructor(roomCode: string, participant: Participant) {
    this.roomCode = roomCode.toUpperCase().trim();
    this.participant = participant;
  }

  public getStatus(): 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'expired' {
    return this.connectionStatus;
  }

  public connect(): void {
    if (typeof window === 'undefined' || this.isExplicitlyClosed || this.isExpired) return;

    // Clear any pending reconnect timer
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${host}/api/rooms/${this.roomCode}/ws?participantId=${encodeURIComponent(
      this.participant.participantId
    )}&displayName=${encodeURIComponent(this.participant.displayName)}`;

    this.connectionStatus = this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting';
    this.notifyListeners({ type: 'connection_status', status: this.connectionStatus as any });

    try {
      if (this.ws) {
        try {
          this.ws.close();
        } catch {}
      }

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.connectionStatus = 'connected';
        this.notifyListeners({ type: 'connection_status', status: 'connected' });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_expired' || data.type === 'room_ended') {
            this.isExpired = true;
            this.connectionStatus = 'expired';
          }
          this.notifyListeners(data);
        } catch {}
      };

      this.ws.onerror = () => {
        if (!this.isExpired && !this.isExplicitlyClosed) {
          this.connectionStatus = 'reconnecting';
          this.notifyListeners({ type: 'connection_status', status: 'reconnecting' });
        }
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (event.code === 410 || event.reason === 'Room expired' || this.isExpired) {
          this.isExpired = true;
          this.connectionStatus = 'expired';
          this.notifyListeners({
            type: 'room_expired',
            roomCode: this.roomCode,
            reason: 'This temporary conversation has ended.',
          });
          return;
        }

        if (!this.isExplicitlyClosed && !this.isExpired) {
          this.connectionStatus = 'reconnecting';
          this.notifyListeners({ type: 'connection_status', status: 'reconnecting' });
          this.scheduleReconnect();
        } else {
          this.connectionStatus = 'disconnected';
          this.notifyListeners({ type: 'connection_status', status: 'disconnected' });
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isExplicitlyClosed || this.isExpired) return;
    this.reconnectAttempts++;
    // Exponential backoff capped at 4s for fast mobile network recovery
    const delay = Math.min(800 * Math.pow(1.3, this.reconnectAttempts), 4000);
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isExplicitlyClosed && !this.isExpired) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch {}
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public subscribe(listener: RealtimeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: RoomEvent): void {
    this.listeners.forEach((l) => {
      try {
        l(event);
      } catch {}
    });
  }

  public sendMessage(content: string, file?: any, customId?: string): Message {
    const msgId = customId || 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const message: Message = {
      id: msgId,
      roomCode: this.roomCode,
      senderId: this.participant.participantId,
      senderName: this.participant.displayName,
      content,
      timestamp: Date.now(),
      type: file ? 'file' : 'text',
      file,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'message',
          id: msgId,
          content,
          file,
        })
      );
    }

    return message;
  }

  public sendTyping(isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'typing',
            typing: isTyping,
          })
        );
      } catch {}
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.connectionStatus = 'disconnected';
    this.listeners = [];
  }
}
