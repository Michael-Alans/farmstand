import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getFarmerProfile(farmerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: farmerId, role: 'FARMER' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isKycVerified: true,
        createdAt: true,
        listings: {
          where: { status: 'ACTIVE' },
          select: {
            id: true, title: true, price: true, unit: true, imageUrl: true, category: true, location: true
          }
        }
      }
    });

    if (!user) throw new NotFoundException('Farmer profile not found');
    return user;
  }

  async getBuyerProfile(buyerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: buyerId, role: 'BUYER' },
      select: {
        id: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isKycVerified: true,
        createdAt: true,
        ordersAsBuyer: {
          where: { status: 'FULFILLED' },
          select: { id: true },
        },
      }
    });

    if (!user) throw new NotFoundException('Buyer profile not found');
    return {
      id: user.id,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isKycVerified: user.isKycVerified,
      createdAt: user.createdAt,
      fulfilledOrderCount: user.ordersAsBuyer.length,
    };
  }

  async updateProfile(userId: string, data: { bio?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, bio: true, avatarUrl: true, isKycVerified: true }
    });
  }

  async simulateKyc(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isKycVerified: true },
      select: { id: true, name: true, isKycVerified: true }
    });
  }

  async getWalletBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
