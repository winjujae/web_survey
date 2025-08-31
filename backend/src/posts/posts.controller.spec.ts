import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostStatus, PostType } from './entities/post.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostsController', () => {
  let controller: PostsController;
  let postsService: PostsService;

  const mockPostsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleLike: jest.fn(),
    toggleBookmark: jest.fn(),
    getUserPosts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
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

    it('should successfully create a post', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.create.mockResolvedValue(mockPost);

      const result = await controller.create(createPostDto, mockRequest);

      expect(mockPostsService.create).toHaveBeenCalledWith(createPostDto, mockUser);
      expect(result).toEqual({
        success: true,
        message: '게시글이 성공적으로 생성되었습니다.',
        data: mockPost,
      });
    });
  });

  describe('findAll', () => {
    const mockPostsData = {
      posts: [
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
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return posts with default query', async () => {
      mockPostsService.findAll.mockResolvedValue(mockPostsData);

      const result = await controller.findAll({}, undefined, undefined, undefined, undefined);

      expect(mockPostsService.findAll).toHaveBeenCalledWith({}, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });
      expect(result).toEqual({
        success: true,
        data: mockPostsData.posts,
        pagination: {
          currentPage: mockPostsData.page,
          totalPages: mockPostsData.totalPages,
          totalItems: mockPostsData.total,
          itemsPerPage: mockPostsData.limit,
        },
      });
    });

    it('should return posts with custom query parameters', async () => {
      const filters = {
        category_id: 'cat1',
        search: 'test',
      };
      const page = '2';
      const limit = '20';
      const sortBy = 'likes';
      const sortOrder = 'DESC';

      mockPostsService.findAll.mockResolvedValue({
        ...mockPostsData,
        page: 2,
        limit: 20,
      });

      const result = await controller.findAll(filters, page, limit, sortBy, sortOrder);

      expect(mockPostsService.findAll).toHaveBeenCalledWith(
        filters,
        {
          page: 2,
          limit: 20,
          sortBy: 'likes',
          sortOrder: 'DESC',
        },
      );
      expect(result).toEqual({
        success: true,
        data: mockPostsData.posts,
        pagination: {
          currentPage: 2,
          totalPages: mockPostsData.totalPages,
          totalItems: mockPostsData.total,
          itemsPerPage: 20,
        },
      });
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

    it('should return a post by id', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.findOne.mockResolvedValue(mockPost);

      const result = await controller.findOne(postId, mockRequest);

      expect(mockPostsService.findOne).toHaveBeenCalledWith(postId, mockUser);
      expect(result).toEqual({
        success: true,
        data: mockPost,
      });
    });
  });

  describe('update', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    const updatePostDto: UpdatePostDto = {
      title: 'Updated Title',
      content: 'Updated content',
      category_id: 'cat123',
    };

    const mockPost: Post = {
      post_id: postId,
      title: 'Updated Title',
      content: 'Updated content',
      user_id: mockUser.user_id,
      status: PostStatus.PUBLISHED,
    } as Post;

    it('should update a post', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.update.mockResolvedValue(mockPost);

      const result = await controller.update(postId, updatePostDto, mockRequest);

      expect(mockPostsService.update).toHaveBeenCalledWith(postId, updatePostDto, mockUser);
      expect(result).toEqual({
        success: true,
        message: '게시글이 성공적으로 수정되었습니다.',
        data: mockPost,
      });
    });
  });

  describe('remove', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    it('should remove a post', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.remove.mockResolvedValue(undefined);

      await controller.remove(postId, mockRequest);

      expect(mockPostsService.remove).toHaveBeenCalledWith(postId, mockUser);
    });
  });

  describe('toggleLike', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
    } as User;

    const mockLikeResult = {
      liked: true,
      likes: 6,
    };

    it('should toggle like on a post', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.toggleLike.mockResolvedValue(mockLikeResult);

      const result = await controller.toggleLike(postId, mockRequest);

      expect(mockPostsService.toggleLike).toHaveBeenCalledWith(postId, mockUser);
      expect(result).toEqual({
        success: true,
        message: '게시글을 좋아요했습니다.',
        data: mockLikeResult,
      });
    });
  });

  describe('toggleBookmark', () => {
    const postId = 'post123';
    const mockUser: User = {
      user_id: 'user123',
    } as User;

    const mockBookmarkResult = {
      bookmarked: true,
    };

    it('should toggle bookmark on a post', async () => {
      const mockRequest = { user: mockUser };
      mockPostsService.toggleBookmark.mockResolvedValue(mockBookmarkResult);

      const result = await controller.toggleBookmark(postId, mockRequest);

      expect(mockPostsService.toggleBookmark).toHaveBeenCalledWith(postId, mockUser);
      expect(result).toEqual({
        success: true,
        message: '게시글을 북마크했습니다.',
        data: mockBookmarkResult,
      });
    });
  });

  describe('getUserPosts', () => {
    const userId = 'user123';
    const mockPostsData = {
      posts: [
        {
          post_id: 'post1',
          title: 'User Post 1',
          status: PostStatus.PUBLISHED,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return user posts', async () => {
      mockPostsService.getUserPosts.mockResolvedValue(mockPostsData);

      const result = await controller.getUserPosts(userId, undefined, undefined);

      expect(mockPostsService.getUserPosts).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });
      expect(result).toEqual({
        success: true,
        data: mockPostsData.posts,
        pagination: {
          currentPage: mockPostsData.page,
          totalPages: mockPostsData.totalPages,
          totalItems: mockPostsData.total,
          itemsPerPage: mockPostsData.limit,
        },
      });
    });

    it('should return user posts with pagination', async () => {
      const page = '2';
      const limit = '5';
      mockPostsService.getUserPosts.mockResolvedValue({
        ...mockPostsData,
        page: 2,
        limit: 5,
      });

      const result = await controller.getUserPosts(userId, page, limit);

      expect(mockPostsService.getUserPosts).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });
      expect(result).toEqual({
        success: true,
        data: mockPostsData.posts,
        pagination: {
          currentPage: 2,
          totalPages: mockPostsData.totalPages,
          totalItems: mockPostsData.total,
          itemsPerPage: 5,
        },
      });
    });
  });
});
