import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @Min(1)
  @IsNumber()
  itemId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  hidden: boolean;
}
