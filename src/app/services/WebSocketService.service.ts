import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: WebSocket;
  private messages = new Subject<string>();

  connect(url: string): void {
    this.socket = new WebSocket(url);

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
}
