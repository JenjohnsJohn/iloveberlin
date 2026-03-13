import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guide } from './entities/guide.entity';
import { GuideTopic } from './entities/guide-topic.entity';
import { Media } from '../media/entities/media.entity';
import { GuidesService } from './guides.service';
import { GuidesController } from './guides.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guide, GuideTopic, Media])],
  providers: [GuidesService],
  controllers: [GuidesController],
  exports: [GuidesService],
})
export class GuidesModule {}
