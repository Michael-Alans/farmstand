import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, WebSocket } from 'ws';
  
  @WebSocketGateway()
  export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    handleConnection(client: WebSocket) {
      console.log('[WS Server] Client connected');
    }
  
    handleDisconnect(client: WebSocket) {
      console.log('[WS Server] Client disconnected');
    }
  
    // Broadcast events to all connected clients
    broadcast(type: string, payload: any) {
      if (!this.server || !this.server.clients) return;
  
      const message = JSON.stringify({ type, payload });
  
      this.server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }