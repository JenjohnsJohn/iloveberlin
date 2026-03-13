import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { VideoSeries } from './entities/video-series.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Media } from '../media/entities/media.entity';
import { Category } from '../categories/entities/category.entity';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Video, VideoSeries, Tag, Media, Category])],
  providers: [VideosService],
  controllers: [VideosController],
  exports: [VideosService],
})
export class VideosModule {}
