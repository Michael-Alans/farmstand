import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { OrderStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('BUYER')
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Roles('BUYER')
  @Get('mine')
  getMyOrders(@CurrentUser() user: any, @Query('status') status?: OrderStatus) {
    return this.ordersService.getMyOrders(user.id, status);
  }

  @Roles('FARMER')
  @Get('received')
  getReceivedOrders(@CurrentUser() user: any, @Query('status') status?: OrderStatus) {
    return this.ordersService.getReceivedOrders(user.id, status);
  }

  @Roles('FARMER')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any
  ) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto, user.id);
  }

  @Roles('BUYER')
  @Post(':id/release-escrow')
  releaseEscrow(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.releaseEscrow(id, user.id);
  }
}
