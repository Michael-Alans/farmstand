import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ListingCategory } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  title: string;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  unit: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  location: string;

  @IsUrl()
  imageUrl: string;
}
