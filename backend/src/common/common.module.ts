import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit.entity';
import { AuditService } from './services/audit.service';
import { WinstonLoggerService } from './logger/winston.logger';
import { SearchLog } from '../analytics/entities/search-log.entity';
import { AnalyticsService } from '../analytics/analytics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog, SearchLog]),
  ],
  providers: [
    AuditService,
    WinstonLoggerService,
    AnalyticsService,
  ],
  exports: [
    AuditService,
    WinstonLoggerService,
    AnalyticsService,
  ],
})
export class CommonModule {}
