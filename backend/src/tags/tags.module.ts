import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { Tag } from './entities/tag.entity';
import { PostTag } from './entities/post-tag.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tag, PostTag]),
    AnalyticsModule,
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}