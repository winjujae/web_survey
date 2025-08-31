import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, CommentStatus } from './entities/comment.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: CommentsService;

  const mockCommentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleLike: jest.fn(),
    getPostComments: jest.fn(),
    getUserComments: jest.fn(),
    getCommentReplies: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
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

    const createCommentDto: CreateCommentDto = {
      post_id: 'post123',
      content: 'Test comment content',
      is_anonymous: false,
    };

    const mockComment: Comment = {
      comment_id: 'comment123',
      ...createCommentDto,
      user_id: mockUser.user_id,
      status: CommentStatus.ACTIVE,
      likes: 0,
      created_at: new Date(),
      updated_at: new Date(),
    } as Comment;

    it('should successfully create a comment', async () => {
      const mockRequest = { user: mockUser };
      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create(createCommentDto, mockRequest);

      expect(mockCommentsService.create).toHaveBeenCalledWith(createCommentDto, mockUser);
      expect(result).toEqual({
        success: true,
        message: '댓글이 성공적으로 생성되었습니다.',
        data: mockComment,
      });
    });
  });

  describe('findAll', () => {
    const mockCommentsData = {
      comments: [
        {
          comment_id: 'comment1',
          content: 'Comment 1',
          status: CommentStatus.ACTIVE,
          user: { user_id: 'user1', nickname: 'user1' },
          post: { post_id: 'post1', title: 'Post 1' },
          replies: [],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return comments with default query', async () => {
      mockCommentsService.findAll.mockResolvedValue(mockCommentsData);

      const result = await controller.findAll({}, undefined, undefined, undefined, undefined);

      expect(mockCommentsService.findAll).toHaveBeenCalledWith({}, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'ASC',
      });
      expect(result).toEqual({
        success: true,
        data: mockCommentsData.comments,
        pagination: {
          currentPage: mockCommentsData.page,
          totalPages: mockCommentsData.totalPages,
          totalItems: mockCommentsData.total,
          itemsPerPage: mockCommentsData.limit,
        },
      });
    });

    it('should return comments with custom query parameters', async () => {
      const filters = {
        post_id: 'post1',
        user_id: 'user1',
      };
      const page = '2';
      const limit = '20';
      const sortBy = 'likes';
      const sortOrder = 'DESC';

      mockCommentsService.findAll.mockResolvedValue({
        ...mockCommentsData,
        page: 2,
        limit: 20,
      });

      const result = await controller.findAll(filters, page, limit, sortBy, sortOrder);

      expect(mockCommentsService.findAll).toHaveBeenCalledWith(
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
        data: mockCommentsData.comments,
        pagination: {
          currentPage: 2,
          totalPages: mockCommentsData.totalPages,
          totalItems: mockCommentsData.total,
          itemsPerPage: 20,
        },
      });
    });
  });

  describe('findOne', () => {
    const commentId = 'comment123';
    const mockComment: Comment = {
      comment_id: commentId,
      content: 'Test comment',
      status: CommentStatus.ACTIVE,
      user: { user_id: 'user1' },
      post: { post_id: 'post1' },
      parent_comment: null,
      replies: [],
    } as Comment;

    it('should return a comment by id', async () => {
      mockCommentsService.findOne.mockResolvedValue(mockComment);

      const result = await controller.findOne(commentId);

      expect(mockCommentsService.findOne).toHaveBeenCalledWith(commentId);
      expect(result).toEqual({
        success: true,
        data: mockComment,
      });
    });
  });

  describe('update', () => {
    const commentId = 'comment123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    const updateCommentDto: UpdateCommentDto = {
      content: 'Updated content',
    };

    const mockComment: Comment = {
      comment_id: commentId,
      content: 'Updated content',
      user_id: mockUser.user_id,
      status: CommentStatus.ACTIVE,
    } as Comment;

    it('should update a comment', async () => {
      const mockRequest = { user: mockUser };
      mockCommentsService.update.mockResolvedValue(mockComment);

      const result = await controller.update(commentId, updateCommentDto, mockRequest);

      expect(mockCommentsService.update).toHaveBeenCalledWith(commentId, updateCommentDto, mockUser);
      expect(result).toEqual({
        success: true,
        message: '댓글이 성공적으로 수정되었습니다.',
        data: mockComment,
      });
    });
  });

  describe('remove', () => {
    const commentId = 'comment123';
    const mockUser: User = {
      user_id: 'user123',
      role: UserRole.USER,
    } as User;

    it('should remove a comment', async () => {
      const mockRequest = { user: mockUser };
      mockCommentsService.remove.mockResolvedValue(undefined);

      await controller.remove(commentId, mockRequest);

      expect(mockCommentsService.remove).toHaveBeenCalledWith(commentId, mockUser);
    });
  });

  describe('toggleLike', () => {
    const commentId = 'comment123';
    const mockUser: User = {
      user_id: 'user123',
    } as User;

    const mockLikeResult = {
      liked: true,
      likes: 6,
    };

    it('should toggle like on a comment', async () => {
      const mockRequest = { user: mockUser };
      mockCommentsService.toggleLike.mockResolvedValue(mockLikeResult);

      const result = await controller.toggleLike(commentId, mockRequest);

      expect(mockCommentsService.toggleLike).toHaveBeenCalledWith(commentId, mockUser);
      expect(result).toEqual({
        success: true,
        message: '댓글을 좋아요했습니다.',
        data: mockLikeResult,
      });
    });
  });

  describe('getPostComments', () => {
    const postId = 'post123';
    const mockCommentsData = {
      comments: [
        {
          comment_id: 'comment1',
          content: 'Post comment 1',
          status: CommentStatus.ACTIVE,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return post comments', async () => {
      mockCommentsService.getPostComments.mockResolvedValue(mockCommentsData);

      const result = await controller.getPostComments(postId, undefined, undefined);

      expect(mockCommentsService.getPostComments).toHaveBeenCalledWith(postId, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'ASC',
      });
      expect(result).toEqual({
        success: true,
        data: mockCommentsData.comments,
        pagination: {
          currentPage: mockCommentsData.page,
          totalPages: mockCommentsData.totalPages,
          totalItems: mockCommentsData.total,
          itemsPerPage: mockCommentsData.limit,
        },
      });
    });

    it('should return post comments with pagination', async () => {
      const page = '2';
      const limit = '5';
      mockCommentsService.getPostComments.mockResolvedValue({
        ...mockCommentsData,
        page: 2,
        limit: 5,
      });

      const result = await controller.getPostComments(postId, page, limit);

      expect(mockCommentsService.getPostComments).toHaveBeenCalledWith(postId, {
        page: 2,
        limit: 5,
        sortBy: 'created_at',
        sortOrder: 'ASC',
      });
      expect(result).toEqual({
        success: true,
        data: mockCommentsData.comments,
        pagination: {
          currentPage: 2,
          totalPages: mockCommentsData.totalPages,
          totalItems: mockCommentsData.total,
          itemsPerPage: 5,
        },
      });
    });
  });

  describe('getUserComments', () => {
    const userId = 'user123';
    const mockCommentsData = {
      comments: [
        {
          comment_id: 'comment1',
          content: 'User comment 1',
          status: CommentStatus.ACTIVE,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return user comments', async () => {
      mockCommentsService.getUserComments.mockResolvedValue(mockCommentsData);

      const result = await controller.getUserComments(userId, undefined, undefined);

      expect(mockCommentsService.getUserComments).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });
      expect(result).toEqual({
        success: true,
        data: mockCommentsData.comments,
        pagination: {
          currentPage: mockCommentsData.page,
          totalPages: mockCommentsData.totalPages,
          totalItems: mockCommentsData.total,
          itemsPerPage: mockCommentsData.limit,
        },
      });
    });
  });

  describe('getCommentReplies', () => {
    const commentId = 'comment123';
    const mockReplies = [
      {
        comment_id: 'reply1',
        content: 'Reply 1',
        user: { user_id: 'user1', nickname: 'user1' },
      },
      {
        comment_id: 'reply2',
        content: 'Reply 2',
        user: { user_id: 'user2', nickname: 'user2' },
      },
    ];

    it('should return comment replies', async () => {
      mockCommentsService.getCommentReplies.mockResolvedValue(mockReplies);

      const result = await controller.getCommentReplies(commentId);

      expect(mockCommentsService.getCommentReplies).toHaveBeenCalledWith(commentId);
      expect(result).toEqual({
        success: true,
        data: mockReplies,
      });
    });
  });
});
