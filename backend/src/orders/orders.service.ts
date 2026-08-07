import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, buyerId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: createOrderDto.listingId }
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.quantity < createOrderDto.quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    const total = listing.price * createOrderDto.quantity;

    return this.prisma.$transaction(async (prisma) => {
      // Create the order
      const order = await prisma.order.create({
        data: {
          listingId: listing.id,
          quantity: createOrderDto.quantity,
          unit: listing.unit,
          unitPriceAtOrder: listing.price,
          total,
          buyerId,
          farmerId: listing.farmerId,
          paymentReference: createOrderDto.paymentReference,
        },
      });

      // Decrement listing stock
      await prisma.listing.update({
        where: { id: listing.id },
        data: { quantity: { decrement: createOrderDto.quantity } },
      });

      return order;
    });
  }

  async getMyOrders(buyerId: string, status?: OrderStatus) {
    const where: any = { buyerId };
    if (status) where.status = status;

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

  async getReceivedOrders(farmerId: string, status?: OrderStatus) {
    const where: any = { farmerId };
    if (status) where.status = status;

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

  async updateStatus(orderId: string, updateDto: UpdateOrderStatusDto, farmerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.farmerId !== farmerId) {
      throw new ForbiddenException('You do not have permission to update this order');
    }

    // Typical simplified transitions: 
    // PENDING -> CONFIRMED, FULFILLED, CANCELLED
    // CONFIRMED -> FULFILLED, CANCELLED
    const validTransitions: Record<string, string[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.FULFILLED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.FULFILLED, OrderStatus.CANCELLED],
    };

    if (!validTransitions[order.status]?.includes(updateDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${updateDto.status}`);
    }

    return this.prisma.$transaction(async (prisma) => {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: updateDto.status },
      });

      // If cancelled, restore the stock
      if (updateDto.status === OrderStatus.CANCELLED) {
        await prisma.listing.update({
          where: { id: order.listingId },
          data: { quantity: { increment: order.quantity } },
        });
      }

      return updatedOrder;
    });
  }

  async releaseEscrow(orderId: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== buyerId) throw new ForbiddenException('Only the buyer can release this escrow');
    if (order.status !== 'FULFILLED') throw new BadRequestException('Order must be FULFILLED before releasing escrow');
    if (order.escrowStatus !== 'HELD') throw new BadRequestException('Escrow is no longer held');

    return this.prisma.$transaction(async (prisma) => {
      // 1. Mark escrow as Released
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { escrowStatus: 'RELEASED' }
      });

      // 2. Transfer funds to Farmer's wallet
      await prisma.user.update({
        where: { id: order.farmerId },
        data: { walletBalance: { increment: order.total } }
      });

      return updatedOrder;
    });
  }
}
