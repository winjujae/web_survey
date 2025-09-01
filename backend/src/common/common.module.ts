import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit.entity';
import { AuditService } from './services/audit.service';
import { WinstonLoggerService } from './logger/winston.logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  providers: [
    AuditService,
    WinstonLoggerService,
  ],
  exports: [
    AuditService,
    WinstonLoggerService,
  ],
})
export class CommonModule {}
