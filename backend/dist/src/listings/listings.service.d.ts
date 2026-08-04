import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { EventsGateway } from "../events.gateway";
export declare class ListingsService {
    private prisma;
    private eventsGateway;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    findAll(q?: string, category?: any, location?: string, minPrice?: number, maxPrice?: number, sort?: string, page?: number, pageSize?: number): Promise<{
        items: {
            id: string;
            createdAt: Date;
            title: string;
            category: import("@prisma/client").$Enums.ListingCategory;
            description: string | null;
            price: number;
            unit: string;
            quantity: number;
            location: string;
            imageUrl: string | null;
            status: import("@prisma/client").$Enums.ListingStatus;
            farmerId: string;
        }[];
        page: number;
        pageSize: number;
        total: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.ListingCategory;
        description: string | null;
        price: number;
        unit: string;
        quantity: number;
        location: string;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ListingStatus;
        farmerId: string;
    }>;
    create(createListingDto: CreateListingDto, farmerId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.ListingCategory;
        description: string | null;
        price: number;
        unit: string;
        quantity: number;
        location: string;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ListingStatus;
        farmerId: string;
    }>;
    update(id: string, updateListingDto: UpdateListingDto, farmerId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        category: import("@prisma/client").$Enums.ListingCategory;
        description: string | null;
        price: number;
        unit: string;
        quantity: number;
        location: string;
        imageUrl: string | null;
        status: import("@prisma/client").$Enums.ListingStatus;
        farmerId: string;
    }>;
    remove(id: string, farmerId: string): Promise<void>;
}
