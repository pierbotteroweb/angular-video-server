import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private messages = new Subject<string>();

  connect(url: string): void {
    this.socket = new WebSocket(this.resolveUrl(url));

    // Listen for messages from the server
    this.socket.onmessage = (event) => {
      this.messages.next(event.data);
    };

    // Handle connection close
    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
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
