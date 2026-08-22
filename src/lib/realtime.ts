import { Message, RoomEvent, Participant } from '@/types';

export type RealtimeListener = (event: RoomEvent) => void;

export class RealtimeClient {
  private roomCode: string;
  private participant: Participant;
  private ws: WebSocket | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: RealtimeListener[] = [];
  private isExplicitlyClosed = false;
  private isExpired = false;
  private reconnectAttempts = 0;
  private pingInterval: any = null;

  constructor(roomCode: string, participant: Participant) {
    this.roomCode = roomCode.toUpperCase().trim();
    this.participant = participant;

    // Cross-tab broadcast synchronization
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(`templink_do_${this.roomCode}`);
      this.broadcastChannel.onmessage = (e) => {
        const event = e.data as RoomEvent;
        this.notifyListeners(event);
      };
    }
  }

  public connect(): void {
    if (typeof window === 'undefined' || this.isExplicitlyClosed || this.isExpired) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const wsUrl = `${protocol}//${host}/api/rooms/${this.roomCode}/ws?participantId=${encodeURIComponent(
      this.participant.participantId
    )}&displayName=${encodeURIComponent(this.participant.displayName)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: 'connection_status', status: 'connected' });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'room_expired' || data.type === 'room_ended') {
            this.isExpired = true;
          }
          this.notifyListeners(data);
          // Broadcast to other tabs
          this.broadcastChannel?.postMessage(data);
        } catch {}
      };

      this.ws.onerror = () => {
        this.notifyListeners({ type: 'connection_status', status: 'reconnecting' });
      };

      this.ws.onclose = (event) => {
        this.stopHeartbeat();
        if (event.code === 410 || event.reason === 'Room expired' || this.isExpired) {
          this.isExpired = true;
          this.notifyListeners({
            type: 'room_expired',
            roomCode: this.roomCode,
            reason: 'Room has expired and was securely erased.',
          });
          return;
        }

        if (!this.isExplicitlyClosed && !this.isExpired) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isExplicitlyClosed || this.isExpired) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    setTimeout(() => {
      if (!this.isExplicitlyClosed && !this.isExpired) {
        this.connect();
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 20000);
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
    this.listeners.forEach((l) => l(event));
  }

  public sendMessage(content: string, file?: any, customId?: string): Message {
    const msgId = customId || 'msg_' + Math.random().toString(36).substring(2, 9);
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

    const event: RoomEvent = {
      type: 'message',
      roomCode: this.roomCode,
      message,
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

    // Local echo & cross-tab sync
    this.notifyListeners(event);
    this.broadcastChannel?.postMessage(event);

    return message;
  }

  public sendTyping(isTyping: boolean): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'typing',
          typing: isTyping,
        })
      );
    }

    const event: RoomEvent = {
      type: 'typing',
      roomCode: this.roomCode,
      participantId: this.participant.participantId,
      displayName: this.participant.displayName,
      typing: isTyping,
    };

    this.broadcastChannel?.postMessage(event);
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    this.listeners = [];
  }
}
