import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, user: any): Promise<{
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
    getMyOrders(user: any, status?: OrderStatus): Promise<({
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
    getReceivedOrders(user: any, status?: OrderStatus): Promise<({
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
    updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, user: any): Promise<{
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
