import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ListingCategory, ListingStatus } from '@prisma/client';

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(ListingCategory)
  @IsOptional()
  category?: ListingCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;
}
