import { PartialType } from '@nestjs/swagger';
import { CreateOfferDto } from './create-offer.dto';
import { Min, IsNumber, IsOptional } from 'class-validator';

export class UpdateOfferDto extends PartialType(CreateOfferDto) {
  @Min(1)
  @IsNumber()
  itemId: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  hidden: boolean;
}
