import { PartialType } from '@nestjs/swagger';
import { CreateClassifiedCategoryDto } from './create-classified-category.dto';

export class UpdateClassifiedCategoryDto extends PartialType(CreateClassifiedCategoryDto) {}
