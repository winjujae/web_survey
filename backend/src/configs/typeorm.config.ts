import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import 'dotenv/config';

export const typeORMConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 true
    logging: process.env.NODE_ENV === 'development',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    migrations: [__dirname + '/../migrations/*.{js,ts}'],
    subscribers: [__dirname + '/../subscribers/*.{js,ts}'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    },
}