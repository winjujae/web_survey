import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getProfile: jest.fn(),
    getUserStats: jest.fn(),
    getUserPosts: jest.fn(),
    getUserComments: jest.fn(),
    getUserBookmarks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      nickname: 'testuser',
      password: 'Password123!',
      bio: 'Test bio',
    };

    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      ...createUserDto,
    };

    it('should successfully create a user', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual({
        success: true,
        message: '사용자가 성공적으로 생성되었습니다.',
        data: mockUser,
      });
    });
  });

  describe('findAll', () => {
    const mockUsers = [
      {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user1@example.com',
        nickname: 'user1',
        role: UserRole.USER,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: '456e7890-e89b-12d3-a456-426614174001',
        email: 'user2@example.com',
        nickname: 'user2',
        role: UserRole.USER,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    it('should return all users', async () => {
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockUsers,
      });
    });
  });

  describe('findOne', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Test bio',
      avatar_url: 'avatar.jpg',
      role: UserRole.USER,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: mockUser,
      });
    });
  });

  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCurrentUser: User = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
      role: UserRole.USER,
    } as User;

    const updateUserDto: UpdateUserDto = {
      nickname: 'newnickname',
      bio: 'New bio',
    };

    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'newnickname',
      bio: 'New bio',
    };

    it('should update a user', async () => {
      mockUsersService.update.mockResolvedValue(mockUser);
      const mockRequest = { user: mockCurrentUser };

      const result = await controller.update(userId, updateUserDto, mockRequest);

      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual({
        success: true,
        message: '사용자 정보가 성공적으로 수정되었습니다.',
        data: mockUser,
      });
    });
  });

  describe('remove', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(userId);

      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        message: '사용자가 성공적으로 삭제되었습니다.',
      });
    });
  });

  describe('getProfile', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockProfile = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Test bio',
      avatar_url: 'avatar.jpg',
      role: UserRole.USER,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      _count: {
        posts: 5,
        comments: 10,
        bookmarks: 3,
      },
    };

    it('should return user profile', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(userId);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: mockProfile,
      });
    });
  });

  describe('getUserStats', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockStats = {
      total_posts: 20,
      total_comments: 50,
      total_bookmarks: 15,
      posts_this_month: 3,
      comments_this_month: 8,
      likes_received: 55,
    };

    it('should return user statistics', async () => {
      mockUsersService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getUserStats(userId);

      expect(mockUsersService.getUserStats).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        success: true,
        data: mockStats,
      });
    });
  });

  describe('getUserPosts', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockPostsData = {
      posts: [
        {
          post_id: 'post1',
          title: 'Test Post',
          content: 'Test content',
          image_urls: ['image1.jpg'],
          likes: 10,
          dislikes: 2,
          view_count: 100,
          created_at: new Date(),
          updated_at: new Date(),
          category: {
            category_id: 'cat1',
            name: 'Test Category',
          },
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
      },
    };

    it('should return user posts with pagination', async () => {
      mockUsersService.getUserPosts.mockResolvedValue(mockPostsData);

      const result = await controller.getUserPosts(userId, 1, 10);

      expect(mockUsersService.getUserPosts).toHaveBeenCalledWith(userId, 1, 10);
      expect(result).toEqual({
        success: true,
        data: mockPostsData.posts,
        pagination: mockPostsData.pagination,
      });
    });
  });

  describe('getUserComments', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCommentsData = {
      comments: [
        {
          comment_id: 'comment1',
          content: 'Test comment',
          likes: 5,
          created_at: new Date(),
          updated_at: new Date(),
          post: {
            post_id: 'post1',
            title: 'Test Post',
          },
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
      },
    };

    it('should return user comments with pagination', async () => {
      mockUsersService.getUserComments.mockResolvedValue(mockCommentsData);

      const result = await controller.getUserComments(userId, 1, 10);

      expect(mockUsersService.getUserComments).toHaveBeenCalledWith(userId, 1, 10);
      expect(result).toEqual({
        success: true,
        data: mockCommentsData.comments,
        pagination: mockCommentsData.pagination,
      });
    });
  });

  describe('getMyBookmarks', () => {
    const mockUser: User = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      role: UserRole.USER,
    } as User;

    const mockBookmarksData = {
      bookmarks: [
        {
          post_id: 'post1',
          title: 'Test Post',
          content: 'Test content',
          image_urls: ['image1.jpg'],
          likes: 10,
          view_count: 100,
          created_at: new Date(),
          user: {
            user_id: 'user1',
            nickname: 'author',
          },
          category: {
            category_id: 'cat1',
            name: 'Test Category',
          },
        },
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 10,
      },
    };

    it('should return user bookmarks with pagination', async () => {
      const mockRequest = { user: mockUser };
      mockUsersService.getUserBookmarks.mockResolvedValue(mockBookmarksData);

      const result = await controller.getMyBookmarks(mockRequest, undefined, undefined);

      expect(mockUsersService.getUserBookmarks).toHaveBeenCalledWith(mockUser.user_id, 1, 10);
      expect(result).toEqual({
        success: true,
        data: mockBookmarksData.bookmarks,
        pagination: mockBookmarksData.pagination,
      });
    });
  });


});
