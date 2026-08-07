import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { EventsGateway } from '../events.gateway';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, // <-- Inject EventsGateway
  ) {}

  async findAll(
    q?: string,
    category?: any,
    location?: string,
    minPrice?: number,
    maxPrice?: number,
    sort: string = 'newest',
    page: number = 1,
    pageSize: number = 20,
  ) {
    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };

    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          farmer: {
            select: { id: true, name: true, avatarUrl: true, isKycVerified: true },
          },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        farmer: {
          select: { id: true, name: true, avatarUrl: true, isKycVerified: true },
        },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async create(createListingDto: CreateListingDto, farmerId: string) {
    const newListing = await this.prisma.listing.create({
      data: {
        ...createListingDto,
        farmerId,
      },
    });

    // Broadcast new listing creation
    this.eventsGateway.broadcast('NEW_LISTING', newListing);

    return newListing;
  }

  async update(id: string, updateListingDto: UpdateListingDto, farmerId: string) {
    const listing = await this.findOne(id);
    if (listing.farmerId !== farmerId) {
      throw new ForbiddenException('You are not authorized to modify this listing');
    }

    const updatedListing = await this.prisma.listing.update({
      where: { id },
      data: updateListingDto,
    });

    // Broadcast update
    this.eventsGateway.broadcast('UPDATE_LISTING', updatedListing);

    return updatedListing;
  }

  async remove(id: string, farmerId: string) {
    const listing = await this.findOne(id);
    if (listing.farmerId !== farmerId) {
      throw new ForbiddenException('You are not authorized to modify this listing');
    }

    await this.prisma.listing.delete({ where: { id } });

    // Broadcast deletion to all clients
    this.eventsGateway.broadcast('DELETE_LISTING', { id });
  }
}