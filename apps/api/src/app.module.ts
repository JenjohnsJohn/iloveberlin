import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { ClassSerializerInterceptor } from '@nestjs/common';
import * as Joi from 'joi';
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { MediaModule } from './media/media.module';
import { ArticlesModule } from './articles/articles.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { GuidesModule } from './guides/guides.module';
import { EventsModule } from './events/events.module';
import { DiningModule } from './dining/dining.module';
import { CompetitionsModule } from './competitions/competitions.module';
import { VideosModule } from './videos/videos.module';
import { ClassifiedsModule } from './classifieds/classifieds.module';
import { HomepageModule } from './homepage/homepage.module';
import { StoreModule } from './store/store.module';
import { SearchModule } from './search/search.module';
import { AdminModule } from './admin/admin.module';
import { AdvertisingModule } from './advertising/advertising.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_HOST: Joi.string().default('localhost'),
        DATABASE_PORT: Joi.number().default(5432),
        DATABASE_USERNAME: Joi.string().default('iloveberlin'),
        DATABASE_PASSWORD: Joi.string().default('iloveberlin'),
        DATABASE_NAME: Joi.string().default('iloveberlin'),
        CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
        JWT_SECRET: Joi.string().when('NODE_ENV', {
          is: 'production',
          then: Joi.required(),
          otherwise: Joi.string().default('dev-jwt-secret-change-in-production'),
        }),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        MEILISEARCH_HOST: Joi.string().default('http://localhost:7700'),
        MEILISEARCH_API_KEY: Joi.string().default('iloveberlin-dev-key'),
        REDIS_URL: Joi.string().optional().allow(''),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    ScheduleModule.forRoot(),
    HealthModule,
    AuthModule,
    UsersModule,
    EmailModule,
    CategoriesModule,
    TagsModule,
    MediaModule,
    ArticlesModule,
    BookmarksModule,
    GuidesModule,
    EventsModule,
    DiningModule,
    CompetitionsModule,
    VideosModule,
    ClassifiedsModule,
    HomepageModule,
    StoreModule,
    SearchModule,
    AdminModule,
    AdvertisingModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*');
  }
}
