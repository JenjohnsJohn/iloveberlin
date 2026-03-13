import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { LocalStorageService } from './storage/local-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          rootPath: configService.get<string>(
            'UPLOAD_DIR',
            path.join(process.cwd(), 'uploads'),
          ),
          serveRoot: '/uploads',
          serveStaticOptions: {
            index: false,
          },
        },
      ],
    }),
  ],
  providers: [MediaService, LocalStorageService],
  controllers: [MediaController],
  exports: [MediaService, LocalStorageService],
})
export class MediaModule {}
