import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const createTypeORMoptions=
    (cfg: ConfigService): TypeOrmModuleOptions => ({
          type: 'postgres',
          url: cfg.get<string>('DATABASE_URL'),
          synchronize: false,          // 운영에서는 false
          autoLoadEntities: true,      // 엔티티 자동 로드(모놀리식에 편리)
          logging: cfg.get('NODE_ENV') !== 'production',
          extra: {
            max: 10,                   
            connectionTimeoutMillis: 5000,
            idleTimeoutMillis: 10000,
          },
        })
