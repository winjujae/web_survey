import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor(@Inject('POSTGRES_POOL') private readonly sql: any) {}

  async getTables(): Promise<any[]> {
    const client = await this.sql.connect();
    try {
      // PostgreSQL에서 모든 테이블 목록 조회
      const { rows } = await client.query(`
        SELECT
          schemaname,
          tablename,
          tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      return rows;
    } finally {
      client.release();
    }
  }

  async getTableStructure(tableName: string): Promise<any[]> {
    const client = await this.sql.connect();
    try {
      // 테이블 구조 조회
      const { rows } = await client.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);
      return rows;
    } finally {
      client.release();
    }
  }
}
