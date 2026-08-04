import { IsInt, IsString, Min } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  listingId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
