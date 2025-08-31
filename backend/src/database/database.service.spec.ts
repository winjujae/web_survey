import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockPostgresPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };

  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: 'POSTGRES_POOL',
          useValue: mockPostgresPool,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTables', () => {
    it('should return all tables successfully', async () => {
      const mockRows = [
        { schemaname: 'public', tablename: 'users', tableowner: 'neondb_owner' },
        { schemaname: 'public', tablename: 'posts', tableowner: 'neondb_owner' },
      ];

      mockPostgresPool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValue({ rows: mockRows });

      const result = await service.getTables();

      expect(mockPostgresPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT
          schemaname,
          tablename,
          tableowner
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      expect(result).toEqual(mockRows);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');

      mockPostgresPool.connect.mockRejectedValue(error);

      await expect(service.getTables()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getTableStructure', () => {
    it('should return table structure successfully', async () => {
      const tableName = 'posts';
      const mockRows = [
        { column_name: 'post_id', data_type: 'uuid', is_nullable: 'NO' },
        { column_name: 'title', data_type: 'character varying', is_nullable: 'NO' },
      ];

      mockPostgresPool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValue({ rows: mockRows });

      const result = await service.getTableStructure(tableName);

      expect(mockPostgresPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(`
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
      expect(result).toEqual(mockRows);
    });

    it('should handle database errors', async () => {
      const tableName = 'posts';
      const error = new Error('Database connection failed');

      mockPostgresPool.connect.mockRejectedValue(error);

      await expect(service.getTableStructure(tableName)).rejects.toThrow('Database connection failed');
    });
  });
});
