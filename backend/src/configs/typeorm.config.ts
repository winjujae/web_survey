import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import 'dotenv/config';

export const createTypeORMoptions = (cfg: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: cfg.get<string>('DATABASE_URL'),
  synchronize: cfg.get('NODE_ENV') !== 'production',  // 개발에서는 true, 운영에서는 false
  autoLoadEntities: true,      // 엔티티 자동 로드(모놀리식에 편리)
  logging: cfg.get('NODE_ENV') !== 'production',
  extra: {
    max: 10,                   
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
  },
});

export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 true
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [__dirname + '/../migrations/*.{js,ts}'],
  subscribers: [__dirname + '/../subscribers/*.{js,ts}'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
};
