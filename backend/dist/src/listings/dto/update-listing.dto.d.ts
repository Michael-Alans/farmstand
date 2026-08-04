import { ListingCategory, ListingStatus } from '@prisma/client';
export declare class UpdateListingDto {
    title?: string;
    category?: ListingCategory;
    description?: string;
    price?: number;
    unit?: string;
    quantity?: number;
    location?: string;
    imageUrl?: string;
    status?: ListingStatus;
}
