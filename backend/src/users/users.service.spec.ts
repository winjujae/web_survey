import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { Comment, CommentStatus } from '../comments/entities/comment.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let postRepository: Repository<Post>;
  let commentRepository: Repository<Comment>;
  let bookmarkRepository: Repository<Bookmark>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockPostRepository = {
    count: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCommentRepository = {
    count: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBookmarkRepository = {
    count: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRepository,
        },
        {
          provide: getRepositoryToken(Bookmark),
          useValue: mockBookmarkRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    commentRepository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    bookmarkRepository = module.get<Repository<Bookmark>>(getRepositoryToken(Bookmark));
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
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [{ email: createUserDto.email }, { nickname: createUserDto.nickname }],
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        password: createUserDto.password,
        bio: createUserDto.bio,
        email: createUserDto.email,
        nickname: createUserDto.nickname,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException when nickname already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        nickname: createUserDto.nickname,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
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

    it('should return all active users', async () => {
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: ['user_id', 'email', 'nickname', 'role', 'is_active', 'created_at', 'updated_at'],
        where: { is_active: true },
      });
      expect(result).toEqual(mockUsers);
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

    it('should return user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, is_active: true },
        select: ['user_id', 'email', 'nickname', 'bio', 'avatar_url', 'role', 'created_at', 'updated_at'],
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    const email = 'test@example.com';
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email,
      nickname: 'testuser',
      is_active: true,
    };

    it('should return user when found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email, is_active: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('findByNickname', () => {
    const nickname = 'testuser';
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname,
      is_active: true,
    };

    it('should return user when found by nickname', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByNickname(nickname);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { nickname, is_active: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by nickname', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByNickname(nickname);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const existingUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'oldnickname',
      bio: 'Old bio',
    };

    const updateUserDto: UpdateUserDto = {
      nickname: 'newnickname',
      bio: 'New bio',
    };

    const mockCurrentUser = {
      user_id: userId,
      role: 'user',
    } as User;

    it('should successfully update user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser); // findOne for findOne
      mockUserRepository.findOne.mockResolvedValueOnce(null); // findOne for nickname check
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValueOnce({
        ...existingUser,
        ...updateUserDto,
      });

      const result = await service.update(userId, updateUserDto, mockCurrentUser);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        ...updateUserDto,
        updated_at: expect.any(Date),
      });
      expect(result).toEqual({
        ...existingUser,
        ...updateUserDto,
      });
    });

    it('should throw ConflictException when nickname already exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.findOne.mockResolvedValueOnce({
        user_id: 'different_user_id',
        nickname: updateUserDto.nickname,
      });

      await expect(service.update(userId, updateUserDto, mockCurrentUser)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
    };

    const mockCurrentUser = {
      user_id: userId,
      role: 'user',
    } as User;

    it('should successfully soft delete user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      await service.remove(userId, mockCurrentUser);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, is_active: true },
        select: ['user_id', 'email', 'nickname', 'bio', 'avatar_url', 'role', 'created_at', 'updated_at'],
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        is_active: false,
        updated_at: expect.any(Date),
      });
    });
  });

  describe('getProfile', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Test bio',
      avatar_url: 'avatar.jpg',
      role: UserRole.USER,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return user profile with stats', async () => {
      const mockUserWithStats = {
        user_id: userId,
        email: 'test@example.com',
        nickname: 'oldnickname',
        bio: 'Old bio',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUserWithStats);
      mockPostRepository.count.mockResolvedValue(5);
      mockCommentRepository.count.mockResolvedValue(10);
      mockBookmarkRepository.count.mockResolvedValue(3);

      const result = await service.getProfile(userId);

      expect(result).toEqual({
        ...mockUserWithStats,
        _count: {
          posts: 5,
          comments: 10,
          bookmarks: 3,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(NotFoundException);
    });

    it('should return profile when user exists but has different data', async () => {
      const existingUser = {
        user_id: 'different_user_id',
        nickname: 'newnickname',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockPostRepository.count.mockResolvedValue(5);
      mockCommentRepository.count.mockResolvedValue(10);
      mockBookmarkRepository.count.mockResolvedValue(3);

      const result = await service.getProfile(userId);

      expect(result).toEqual({
        ...existingUser,
        _count: {
          posts: 5,
          comments: 10,
          bookmarks: 3,
        },
      });
    });
  });

  describe('getUserStats', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';

    it('should return user statistics', async () => {
      mockPostRepository.count.mockResolvedValueOnce(20); // total posts
      mockCommentRepository.count.mockResolvedValueOnce(50); // total comments
      mockBookmarkRepository.count.mockResolvedValueOnce(15); // total bookmarks
      mockPostRepository.count.mockResolvedValueOnce(3); // posts this month
      mockCommentRepository.count.mockResolvedValueOnce(8); // comments this month

      // Mock query builder for likes
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCommentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '25' }); // post likes
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '30' }); // comment likes

      const result = await service.getUserStats(userId);

      expect(result).toEqual({
        total_posts: 20,
        total_comments: 50,
        total_bookmarks: 15,
        posts_this_month: 3,
        comments_this_month: 8,
        likes_received: 55, // 25 + 30
      });
    });
  });

  describe('getUserPosts', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
    };

    const mockPosts = [
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
    ];

    it('should return user posts with pagination', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPostRepository.findAndCount.mockResolvedValue([mockPosts, 1]);

      const result = await service.getUserPosts(userId, 1, 10);

      expect(result).toEqual({
        posts: mockPosts,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getUserComments', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
    };

    const mockComments = [
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
    ];

    it('should return user comments with pagination', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockCommentRepository.findAndCount.mockResolvedValue([mockComments, 1]);

      const result = await service.getUserComments(userId, 1, 10);

      expect(result).toEqual({
        comments: mockComments,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });

  describe('getUserBookmarks', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUser = {
      user_id: userId,
      email: 'test@example.com',
      nickname: 'testuser',
    };

    const mockBookmarks = [
      {
        bookmark_id: 'bookmark1',
        created_at: new Date(),
        post: {
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
      },
    ];

    it('should return user bookmarks with pagination', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockBookmarkRepository.findAndCount.mockResolvedValue([mockBookmarks, 1]);

      const result = await service.getUserBookmarks(userId, 1, 10);

      expect(result).toEqual({
        bookmarks: [mockBookmarks[0].post],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      });
    });
  });
});
