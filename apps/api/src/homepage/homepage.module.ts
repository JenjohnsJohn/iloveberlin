import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomepageFeatured } from './entities/homepage-featured.entity';
import { HomepageService } from './homepage.service';
import { HomepageController } from './homepage.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HomepageFeatured])],
  providers: [HomepageService],
  controllers: [HomepageController],
  exports: [HomepageService],
})
export class HomepageModule {}
