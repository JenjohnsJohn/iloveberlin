import { PartialType } from '@nestjs/swagger';
import { CreateVideoSeriesDto } from './create-video-series.dto';

export class UpdateVideoSeriesDto extends PartialType(CreateVideoSeriesDto) {}
