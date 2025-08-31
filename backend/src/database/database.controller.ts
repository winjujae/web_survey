import { Controller, Get, Param } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private databaseService: DatabaseService) {}

    @Get()
    async getTables() {
        try {
            // 모든 테이블 목록 조회
            const tables = await this.databaseService.getTables();
            return {
                success: true,
                data: tables
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    @Get('structure/:tableName')
    async getTableStructure(@Param('tableName') tableName: string) {
        try {
            const structure = await this.databaseService.getTableStructure(tableName);
            return {
                success: true,
                table: tableName,
                columns: structure
            };
        } catch (error) {
            return {
                success: false,
                table: tableName,
                error: error.message
            };
        }
    }

    @Get('posts')
    async getPostsTableStructure() {
        try {
            const structure = await this.databaseService.getTableStructure('posts');
            return {
                success: true,
                table: 'posts',
                columns: structure
            };
        } catch (error) {
            return {
                success: false,
                table: 'posts',
                error: error.message
            };
        }
    }
}
