import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expert } from './entities/expert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expert])],
  controllers: [],
  providers: [],
  exports: [],
})
export class ExpertsModule {}
