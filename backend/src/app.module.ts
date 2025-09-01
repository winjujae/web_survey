import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeORMConfig),
    ThrottlerModule.forRoot({
      ttl: 60, // 1분
      limit: 10, // 1분에 10회 요청
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
    DatabaseModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
