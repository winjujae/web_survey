import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';

describe('DatabaseController', () => {
  let controller: DatabaseController;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    getTable: jest.fn(),
  };

  const mockPostgresPool = {
    connect: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabaseController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: 'POSTGRES_POOL',
          useValue: mockPostgresPool,
        },
      ],
    }).compile();

    controller = module.get<DatabaseController>(DatabaseController);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTable', () => {
    it('should return table data', async () => {
      const mockTableData = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];

      mockDatabaseService.getTable.mockResolvedValue(mockTableData);

      const result = await controller.getTable();

      expect(mockDatabaseService.getTable).toHaveBeenCalledWith('playing_with_neon');
      expect(result).toEqual(mockTableData);
    });
  });
});
