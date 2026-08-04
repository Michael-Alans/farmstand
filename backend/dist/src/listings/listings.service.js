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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_gateway_1 = require("../events.gateway");
let ListingsService = class ListingsService {
    prisma;
    eventsGateway;
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async findAll(q, category, location, minPrice, maxPrice, sort = 'newest', page = 1, pageSize = 20) {
        const where = {};
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (category)
            where.category = category;
        if (location)
            where.location = { contains: location, mode: 'insensitive' };
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice)
                where.price.gte = minPrice;
            if (maxPrice)
                where.price.lte = maxPrice;
        }
        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc')
            orderBy = { price: 'asc' };
        else if (sort === 'price_desc')
            orderBy = { price: 'desc' };
        const skip = (page - 1) * pageSize;
        const [items, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                orderBy,
                skip,
                take: pageSize,
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
    async findOne(id) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return listing;
    }
    async create(createListingDto, farmerId) {
        const newListing = await this.prisma.listing.create({
            data: {
                ...createListingDto,
                farmerId,
            },
        });
        this.eventsGateway.broadcast('NEW_LISTING', newListing);
        return newListing;
    }
    async update(id, updateListingDto, farmerId) {
        const listing = await this.findOne(id);
        if (listing.farmerId !== farmerId) {
            throw new common_1.ForbiddenException('You are not authorized to modify this listing');
        }
        const updatedListing = await this.prisma.listing.update({
            where: { id },
            data: updateListingDto,
        });
        this.eventsGateway.broadcast('UPDATE_LISTING', updatedListing);
        return updatedListing;
    }
    async remove(id, farmerId) {
        const listing = await this.findOne(id);
        if (listing.farmerId !== farmerId) {
            throw new common_1.ForbiddenException('You are not authorized to modify this listing');
        }
        await this.prisma.listing.delete({ where: { id } });
        this.eventsGateway.broadcast('DELETE_LISTING', { id });
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], ListingsService);
//# sourceMappingURL=listings.service.js.map