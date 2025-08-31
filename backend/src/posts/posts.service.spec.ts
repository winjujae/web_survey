import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post, PostStatus, PostType } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let postRepository: Repository<Post>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    postRepository = module.get<Repository<Post>>(getRepositoryToken(Post));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockUser: User = {
      user_id: 'user123',
      email: 'test@example.com',
      nickname: 'testuser',
      role: UserRole.USER,
    } as User;

    const mockCategory: Category = {
      category_id: 'cat123',
      name: 'Test Category',
      is_active: true,
    } as Category;

    const createPostDto: CreatePostDto = {
      title: 'Test Post',
      content: 'Test content',
      type: PostType.TEXT,
      category_id: 'cat123',
      image_urls: ['image1.jpg'],
      is_anonymous: false,
    };

    const mockPost: Post = {
      post_id: 'post123',
      ...createPostDto,
      user_id: mockUser.user_id,
      status: PostStatus.PUBLISHED,
      likes: 0,
      dislikes: 0,
      view_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    } as Post;

    it('should successfully create a post without category', async () => {
      const dtoWithoutCategory = { ...createPostDto, category_id: undefined };
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(dtoWithoutCategory, mockUser);

      expect(mockCategoryRepository.findOne).not.toHaveBeenCalled();
      expect(mockPostRepository.create).toHaveBeenCalledWith({
        ...dtoWithoutCategory,
        user_id: mockUser.user_id,
        category_id: undefined,
      });
      expect(result).toEqual(mockPost);
    });

    it('should successfully create a post with category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockPostRepository.create.mockReturnValue(mockPost);
      mockPostRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(createPostDto, mockUser);

      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { category_id: createPostDto.category_id, is_active: true },
      });
      expect(result).toEqual(mockPost);
    });

    it('should throw BadRequestException when category does not exist', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createPostDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    const mockPosts = [
      {
        post_id: 'post1',
        title: 'Post 1',
        content: 'Content 1',
        status: PostStatus.PUBLISHED,
        is_active: true,
        user: { user_id: 'user1', nickname: 'user1' },
        category: { category_id: 'cat1', name: 'Category 1' },
      },
      {
        post_id: 'post2',
        title: 'Post 2',
        content: 'Content 2',
        status: PostStatus.PUBLISHED,
        is_active: true,
        user: { user_id: 'user2', nickname: 'user2' },
        category: { category_id: 'cat2', name: 'Category 2' },
      },
    ];

    it('should return posts with default pagination', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPosts, 2]),
      };

      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(result).toEqual({
        posts: mockPosts,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        category_id: 'cat1',
        type: PostType.TEXT,
        user_id: 'user1',
        search: 'test',
        is_anonymous: false,
      };

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPosts, 2]),
      };

      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findAll(filters);

      // Check that where and andWhere are called correctly
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'post.status = :status',
        { status: PostStatus.PUBLISHED },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        1,
        'post.is_active = :isActive',
        { isActive: true },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        2,
        'post.category_id = :categoryId',
        { categoryId: filters.category_id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        3,
        'post.type = :type',
        { type: filters.type },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        4,
        'post.user_id = :userId',
        { userId: filters.user_id },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenNthCalledWith(
        5,
        'post.is_anonymous = :isAnonymous',
        { isAnonymous: filters.is_anonymous },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    });
  });

  describe('findOne', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    const mockPost: Post = {
      post_id: postId,
      title: 'Test Post',
      content: 'Test content',
      status: PostStatus.PUBLISHED,
      user_id: 'author123',
      view_count: 10,
      user: { user_id: 'author123' },
      category: { category_id: 'cat1' },
    } as Post;

    it('should return post when found and published', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(postId, mockUser);

      expect(result).toEqual(mockPost);
      expect(mockPostRepository.increment).toHaveBeenCalledWith(
        { post_id: postId },
        'view_count',
        1,
      );
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(postId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when accessing private post', async () => {
      const privatePost = { ...mockPost, status: PostStatus.DRAFT };
      mockPostRepository.findOne.mockResolvedValue(privatePost);

      await expect(service.findOne(postId, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not increment view count for own post', async () => {
      const ownPost = { ...mockPost, user_id: mockUser.user_id };
      mockPostRepository.findOne.mockResolvedValue(ownPost);

      await service.findOne(postId, mockUser);

      expect(mockPostRepository.increment).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    const mockPost: Post = {
      post_id: postId,
      title: 'Original Title',
      content: 'Original content',
      user_id: mockUser.user_id,
      status: PostStatus.PUBLISHED,
    } as Post;

    const updatePostDto: UpdatePostDto = {
      title: 'Updated Title',
      content: 'Updated content',
      category_id: 'cat123',
    };

    it('should successfully update post', async () => {
      mockPostRepository.findOne.mockResolvedValueOnce(mockPost);
      mockCategoryRepository.findOne.mockResolvedValue({
        category_id: 'cat123',
        is_active: true,
      });
      mockPostRepository.update.mockResolvedValue(undefined);
      mockPostRepository.findOne.mockResolvedValueOnce({
        ...mockPost,
        ...updatePostDto,
      });

      const result = await service.update(postId, updatePostDto, mockUser);

      expect(mockPostRepository.update).toHaveBeenCalledWith(postId, {
        title: updatePostDto.title,
        content: updatePostDto.content,
        category_id: updatePostDto.category_id,
        updated_at: expect.any(Date),
      });
      expect(result).toEqual({
        ...mockPost,
        ...updatePostDto,
      });
    });

    it('should throw ForbiddenException when user is not the author', async () => {
      const otherUserPost = { ...mockPost, user_id: 'other_user' };
      mockPostRepository.findOne.mockResolvedValue(otherUserPost);

      await expect(
        service.update(postId, updatePostDto, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when category does not exist', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(postId, updatePostDto, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    const mockPost: Post = {
      post_id: postId,
      title: 'Test Post',
      user_id: mockUser.user_id,
      status: PostStatus.PUBLISHED,
    } as Post;

    it('should successfully remove post by author', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.update.mockResolvedValue(undefined);

      await service.remove(postId, mockUser);

      expect(mockPostRepository.update).toHaveBeenCalledWith(postId, {
        status: PostStatus.DELETED,
        updated_at: expect.any(Date),
      });
    });

    it('should successfully remove post by admin', async () => {
      const adminUser = { ...mockUser, role: UserRole.ADMIN };
      const otherUserPost = { ...mockPost, user_id: 'other_user' };

      mockPostRepository.findOne.mockResolvedValue(otherUserPost);
      mockPostRepository.update.mockResolvedValue(undefined);

      await service.remove(postId, adminUser);

      expect(mockPostRepository.update).toHaveBeenCalledWith(postId, {
        status: PostStatus.DELETED,
        updated_at: expect.any(Date),
      });
    });

    it('should throw ForbiddenException when user is not author or admin', async () => {
      const otherUserPost = { ...mockPost, user_id: 'other_user' };
      mockPostRepository.findOne.mockResolvedValue(otherUserPost);

      await expect(service.remove(postId, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('toggleLike', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
    } as User;

    const mockPost: Post = {
      post_id: postId,
      title: 'Test Post',
      likes: 5,
    } as Post;

    it('should toggle like successfully', async () => {
      mockPostRepository.findOne.mockResolvedValue(mockPost);
      mockPostRepository.save.mockResolvedValue({ ...mockPost, likes: 6 });

      const result = await service.toggleLike(postId, mockUser);

      expect(result).toEqual({
        liked: true,
        likes: 6,
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      await expect(service.toggleLike(postId, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleBookmark', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
    } as User;

    it('should return bookmark status', async () => {
      const mockPost: Post = {
        post_id: postId,
        title: 'Test Post',
      } as Post;

      mockPostRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.toggleBookmark(postId, mockUser);

      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { post_id: postId },
      });
      expect(result).toEqual({
        bookmarked: true,
      });
    });
  });

  describe('getUserPosts', () => {
    const userId = 'user123';
    const mockPosts = [
      {
        post_id: 'post1',
        title: 'User Post 1',
        status: PostStatus.PUBLISHED,
      },
    ];

    it('should return user posts', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockPosts, 1]),
      };

      mockPostRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getUserPosts(userId);

      expect(result).toEqual({
        posts: mockPosts,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
