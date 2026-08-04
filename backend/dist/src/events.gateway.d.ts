import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: WebSocket): void;
    handleDisconnect(client: WebSocket): void;
    broadcast(type: string, payload: any): void;
}
