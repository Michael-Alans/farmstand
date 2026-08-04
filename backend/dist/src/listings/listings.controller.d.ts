import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsController {
    private readonly listingsService;
    constructor(listingsService: ListingsService);
    findAll(q?: string, category?: any, location?: string, minPrice?: string, maxPrice?: string, sort?: string, page?: string, pageSize?: string): Promise<{
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
    create(createListingDto: CreateListingDto, user: any): Promise<{
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
    update(id: string, updateListingDto: UpdateListingDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<void>;
}
