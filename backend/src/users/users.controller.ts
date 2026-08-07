import { Controller, Get, Param, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('farmer/:id')
  async getFarmerProfile(@Param('id') id: string) {
    return this.usersService.getFarmerProfile(id);
  }

  @Get('buyer/:id')
  async getBuyerProfile(@Param('id') id: string) {
    return this.usersService.getBuyerProfile(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { bio?: string; avatarUrl?: string }
  ) {
    return this.usersService.updateProfile(user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/simulate-kyc')
  async simulateKyc(@CurrentUser() user: any) {
    return this.usersService.simulateKyc(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/wallet')
  async getWalletBalance(@CurrentUser() user: any) {
    return this.usersService.getWalletBalance(user.id);
  }
}
