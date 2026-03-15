import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { LocalStorageService } from './storage/local-storage.service';
import { R2StorageService } from './storage/r2-storage.service';

const isR2 = process.env.STORAGE_BACKEND === 'r2';

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    // Only serve local files when using local storage
    ...(isR2
      ? []
      : [
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
        ]),
  ],
  providers: [
    MediaService,
    {
      provide: 'STORAGE_SERVICE',
      useFactory: (config: ConfigService) => {
        if (config.get('STORAGE_BACKEND') === 'r2') {
          return new R2StorageService(config);
        }
        return new LocalStorageService(config);
      },
      inject: [ConfigService],
    },
  ],
  controllers: [MediaController],
  exports: [MediaService, 'STORAGE_SERVICE'],
})
export class MediaModule {}
