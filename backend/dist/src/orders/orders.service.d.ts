import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createOrderDto: CreateOrderDto, buyerId: string): Promise<{
        id: string;
        createdAt: Date;
        unit: string;
        quantity: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        farmerId: string;
        total: number;
        listingId: string;
        unitPriceAtOrder: number;
        buyerId: string;
    }>;
    getMyOrders(buyerId: string, status?: OrderStatus): Promise<({
        listing: {
            title: string;
        };
        farmer: {
            name: string;
        };
        buyer: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        unit: string;
        quantity: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        farmerId: string;
        total: number;
        listingId: string;
        unitPriceAtOrder: number;
        buyerId: string;
    })[]>;
    getReceivedOrders(farmerId: string, status?: OrderStatus): Promise<({
        listing: {
            title: string;
        };
        farmer: {
            name: string;
        };
        buyer: {
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        unit: string;
        quantity: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        farmerId: string;
        total: number;
        listingId: string;
        unitPriceAtOrder: number;
        buyerId: string;
    })[]>;
    updateStatus(orderId: string, updateDto: UpdateOrderStatusDto, farmerId: string): Promise<{
        id: string;
        createdAt: Date;
        unit: string;
        quantity: number;
        status: import("@prisma/client").$Enums.OrderStatus;
        farmerId: string;
        total: number;
        listingId: string;
        unitPriceAtOrder: number;
        buyerId: string;
    }>;
}
