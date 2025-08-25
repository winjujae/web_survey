import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private databaseService: DatabaseService){
    };
    
    @Get()
    async getTable() {
        return await this.databaseService.getTable('playing_with_neon');
    }

}
