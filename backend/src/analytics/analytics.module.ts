import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchLog } from './entities/search-log.entity';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchLog])],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}