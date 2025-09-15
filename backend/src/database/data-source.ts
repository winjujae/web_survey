import 'reflect-metadata';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // include sslmode=require, etc.
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity.{js,ts}'],
  migrations: ['src/migrations/*.{ts,js}'],
  subscribers: ['src/subscribers/*.{ts,js}'],
  // If needed for some environments:
//   ssl: true,
//   extra: { ssl: { rejectUnauthorized: false } },
});