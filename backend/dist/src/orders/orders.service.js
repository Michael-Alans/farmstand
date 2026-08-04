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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createOrderDto, buyerId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: createOrderDto.listingId }
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.quantity < createOrderDto.quantity) {
            throw new common_1.BadRequestException('Requested quantity exceeds available stock');
        }
        const total = listing.price * createOrderDto.quantity;
        return this.prisma.$transaction(async (prisma) => {
            const order = await prisma.order.create({
                data: {
                    listingId: listing.id,
                    quantity: createOrderDto.quantity,
                    unit: listing.unit,
                    unitPriceAtOrder: listing.price,
                    total,
                    buyerId,
                    farmerId: listing.farmerId,
                },
            });
            await prisma.listing.update({
                where: { id: listing.id },
                data: { quantity: { decrement: createOrderDto.quantity } },
            });
            return order;
        });
    }
    async getMyOrders(buyerId, status) {
        const where = { buyerId };
        if (status)
            where.status = status;
        return this.prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                listing: { select: { title: true } },
                farmer: { select: { name: true } },
                buyer: { select: { name: true } }
            }
        });
    }
    async getReceivedOrders(farmerId, status) {
        const where = { farmerId };
        if (status)
            where.status = status;
        return this.prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                listing: { select: { title: true } },
                farmer: { select: { name: true } },
                buyer: { select: { name: true } }
            }
        });
    }
    async updateStatus(orderId, updateDto, farmerId) {
        const order = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.farmerId !== farmerId) {
            throw new common_1.ForbiddenException('You do not have permission to update this order');
        }
        const validTransitions = {
            [client_1.OrderStatus.PENDING]: [client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.FULFILLED, client_1.OrderStatus.CANCELLED],
            [client_1.OrderStatus.CONFIRMED]: [client_1.OrderStatus.FULFILLED, client_1.OrderStatus.CANCELLED],
        };
        if (!validTransitions[order.status]?.includes(updateDto.status)) {
            throw new common_1.BadRequestException(`Invalid status transition from ${order.status} to ${updateDto.status}`);
        }
        return this.prisma.$transaction(async (prisma) => {
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: { status: updateDto.status },
            });
            if (updateDto.status === client_1.OrderStatus.CANCELLED) {
                await prisma.listing.update({
                    where: { id: order.listingId },
                    data: { quantity: { increment: order.quantity } },
                });
            }
            return updatedOrder;
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map