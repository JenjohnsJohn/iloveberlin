import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Competition } from './entities/competition.entity';
import { CompetitionEntry } from './entities/competition-entry.entity';
import { Category } from '../categories/entities/category.entity';
import { Media } from '../media/entities/media.entity';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Competition, CompetitionEntry, Category, Media])],
  providers: [CompetitionsService],
  controllers: [CompetitionsController],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
