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

  describe('getTable', () => {
    it('should return table data successfully', async () => {
      const tableName = 'test_table';
      const mockRows = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];

      mockPostgresPool.connect.mockResolvedValue(mockClient);
      mockClient.query.mockResolvedValue({ rows: mockRows });

      const result = await service.getTable(tableName);

      expect(mockPostgresPool.connect).toHaveBeenCalled();
      expect(mockClient.query).toHaveBeenCalledWith(`SELECT * FROM ${tableName}`);
      expect(result).toEqual(mockRows);
    });

    it('should handle database errors', async () => {
      const tableName = 'test_table';
      const error = new Error('Database connection failed');

      mockPostgresPool.connect.mockRejectedValue(error);

      await expect(service.getTable(tableName)).rejects.toThrow('Database connection failed');
    });
  });
});
