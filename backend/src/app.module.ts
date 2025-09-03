import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';


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
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeORMConfig),

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
    TagsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
