import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { Report } from '../reports/entities/report.entity';
import { Like } from './entities/like.entity';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Category, Comment, Bookmark, Report, Like]),
    AuthModule,
    CommonModule,
    forwardRef(() => TagsModule), // 순환 참조 방지
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
