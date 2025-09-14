import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import {getTypeConfig} from '@nestjs/'

// Auth Module
import { AuthModule } from './auth/auth.module';

// Feature Modules
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ReportsModule } from './reports/reports.module';
import { CategoriesModule } from './categories/categories.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ExpertsModule } from './experts/experts.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';

// Database Module
import { DatabaseModule } from './database/database.module';

// Common Module
import { CommonModule } from './common/common.module';

// Tags Module
import { TagsModule } from './tags/tags.module';
import { Config } from 'winston/lib/winston/config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      envFilePath : (process.env.NODE_ENV === 'production') ? '.production.env'
      : (process.env.NODE_ENV === '.stage.env') ? '.stage.env' : '.development.env',
      expandVariables : true,
      isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        url: cfg.get<string>('DATABASE_URL'), // e.g. postgresql://user:pass@ep-...neon.tech/db?sslmode=require
        ssl: true,
        synchronize: false,          // 운영에서는 false
        autoLoadEntities: true,      // 엔티티 자동 로드(모놀리식에 편리)
        logging: cfg.get('NODE_ENV') !== 'production',
        extra: {
          max: 10,                   // 풀 크기 (Neon 서버리스 특성상 크게 잡지 않기)
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 10000,
        },
      }),
    }),

    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    BookmarksModule,
    ReportsModule,
    CategoriesModule,
    NotificationsModule,
    ExpertsModule,
    HospitalsModule,
    ProductsModule,
    ReviewsModule,
    // DatabaseModule,
    CommonModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
