import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private messages = new Subject<string>();
  private currentUrl: string = '';
  private reconnectTimer: any;
  private intentionalClose: boolean = false;
  private readonly reconnectDelayInMs: number = 3000;

  connect(url: string): void {
    const resolvedUrl = this.resolveUrl(url);

    this.currentUrl = resolvedUrl;
    this.intentionalClose = false;

    if (
      this.socket &&
      this.socket.url === resolvedUrl &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.closeSocketWithoutReconnect();
    this.openSocket(resolvedUrl);
  }

  disconnect(): void {
    this.intentionalClose = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.closeSocketWithoutReconnect();
  }

  private openSocket(url: string): void {
    this.socket = new WebSocket(url);

    // Listen for messages from the server
    this.socket.onmessage = (event) => {
      console.log("this.socket.onmessage event",JSON.parse(event.data).change.updateDescription.updatedFields)
      this.messages.next(event.data);
    };

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onerror = () => {
      console.log('WebSocket connection error');

      if (this.socket) {
        this.socket.close();
      }
    };

    // Handle connection close
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.intentionalClose || this.reconnectTimer || !this.currentUrl) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket(this.currentUrl);
    }, this.reconnectDelayInMs);
  }

  private closeSocketWithoutReconnect(): void {
    if (!this.socket) {
      return;
    }

    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onclose = null;

    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }
  }

  sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    }
  }

  getMessages() {
    return this.messages.asObservable();
  }

  private resolveUrl(url: string): string {
    if (url.startsWith('ws://') || url.startsWith('wss://')) {
      return url;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${protocol}//${window.location.host}${path}`;
  }
}
