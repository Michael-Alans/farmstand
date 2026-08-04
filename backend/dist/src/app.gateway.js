"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
let AppGateway = class AppGateway {
    server;
    handleConnection(client) {
        console.log('[WS Server] Client connected');
    }
    handleDisconnect(client) {
        console.log('[WS Server] Client disconnected');
    }
    broadcast(type, payload) {
        if (!this.server || !this.server.clients)
            return;
        const message = JSON.stringify({ type, payload });
        this.server.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
};
exports.AppGateway = AppGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", ws_1.Server)
], AppGateway.prototype, "server", void 0);
exports.AppGateway = AppGateway = __decorate([
    (0, websockets_1.WebSocketGateway)()
], AppGateway);
//# sourceMappingURL=app.gateway.js.map