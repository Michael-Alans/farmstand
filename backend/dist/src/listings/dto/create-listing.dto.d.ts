import { ListingCategory } from '@prisma/client';
export declare class CreateListingDto {
    title: string;
    category: ListingCategory;
    description?: string;
    price: number;
    unit: string;
    quantity: number;
    location: string;
    imageUrl: string;
}
