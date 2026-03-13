import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classified } from './entities/classified.entity';
import { ClassifiedCategory } from './entities/classified-category.entity';
import { ClassifiedImage } from './entities/classified-image.entity';
import { ClassifiedMessage } from './entities/classified-message.entity';
import { ClassifiedReport } from './entities/classified-report.entity';
import { ClassifiedsService } from './classifieds.service';
import { ClassifiedsController } from './classifieds.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classified,
      ClassifiedCategory,
      ClassifiedImage,
      ClassifiedMessage,
      ClassifiedReport,
    ]),
  ],
  providers: [ClassifiedsService],
  controllers: [ClassifiedsController],
  exports: [ClassifiedsService],
})
export class ClassifiedsModule {}
