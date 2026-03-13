import { PartialType } from '@nestjs/swagger';
import { CreateDiningOfferDto } from './create-dining-offer.dto';

export class UpdateDiningOfferDto extends PartialType(CreateDiningOfferDto) {}
