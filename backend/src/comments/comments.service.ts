import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from './entities/comment.entity';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuditService, AuditAction, AuditResource } from '../common/services/audit.service';
import { Like, LikeType, LikeValue } from '../posts/entities/like.entity';

export interface CommentFilters {
  post_id?: string;
  user_id?: string;
  status?: CommentStatus;
  parent_only?: boolean; // 부모 댓글만 가져오기
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'likes';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    private auditService: AuditService,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const { post_id, parent_comment_id, ...commentData } = createCommentDto;

    // 게시글 존재 확인
    const post = await this.postRepository.findOne({
      where: { post_id, status: PostStatus.PUBLISHED },
    });
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 부모 댓글 확인 (대댓글인 경우)
    let parentComment: Comment | null = null;
    if (parent_comment_id) {
      parentComment = await this.commentRepository.findOne({
        where: { comment_id: parent_comment_id },
      });
      if (!parentComment) {
        throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
      }
      // 부모 댓글이 이미 대댓글인 경우 (3단계 이상 방지)
      if (parentComment.parent_comment_id) {
        throw new BadRequestException('대댓글에는 답글을 달 수 없습니다.');
      }
    }

    // 댓글 생성
    const comment = this.commentRepository.create({
      ...commentData,
      post_id: post.post_id,
      user_id: user.user_id,
      parent_comment_id,
    });

    const savedComment = await this.commentRepository.save(comment);

    // 감사 로그 기록
    await this.auditService.logCommentAction(
      user.user_id,
      AuditAction.CREATE,
      savedComment.comment_id,
      undefined,
      { content: savedComment.content, post_id: savedComment.post_id },
      { parent_comment_id },
    );

    // 관계 포함하여 다시 조회해서 사용자 정보(닉네임 등)를 포함해 반환
    return this.findOne(savedComment.comment_id);
  }

  async findAll(
    filters: CommentFilters = {},
    pagination: PaginationOptions = {},
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'ASC',
    } = pagination;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .where('comment.status IN (:...statuses)', { statuses: [CommentStatus.ACTIVE, CommentStatus.DELETED] });

    // 필터 적용
    if (filters.post_id) {
      queryBuilder.andWhere('comment.post_id = :postId', {
        postId: filters.post_id,
      });
    }

    if (filters.user_id) {
      queryBuilder.andWhere('comment.user_id = :userId', {
        userId: filters.user_id,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('comment.status = :status', {
        status: filters.status,
      });
    }

    if (filters.parent_only) {
      queryBuilder.andWhere('comment.parent_comment_id IS NULL');
    }

    // 정렬
    queryBuilder.orderBy(`comment.${sortBy}`, sortOrder);

    // 페이지네이션
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      comments,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { comment_id: id },
      relations: ['user', 'post', 'parent_comment', 'replies', 'replies.user'],
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // 작성자 또는 관리자 확인
    if (comment.user_id !== user.user_id && user.role !== 'admin') {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    // 상태 확인
    if (comment.status !== CommentStatus.ACTIVE) {
      throw new ForbiddenException('수정할 수 없는 댓글입니다.');
    }

    await this.commentRepository.update(id, {
      ...updateCommentDto,
      updated_at: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: string, user: User): Promise<void> {
    const comment = await this.findOne(id);

    // 작성자 또는 관리자 확인
    if (comment.user_id !== user.user_id && user.role !== 'admin') {
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제
    await this.commentRepository.update(id, {
      status: CommentStatus.DELETED,
      updated_at: new Date(),
    });
  }

  async toggleLike(
    id: string,
    user: User,
  ): Promise<{ liked: boolean; likes: number }> {
    const comment = await this.commentRepository.findOne({
      where: { comment_id: id },
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    // 기존 좋아요 확인
    const existingLike = await this.likeRepository.findOne({
      where: {
        user_id: user.user_id,
        comment_id: id,
        type: LikeType.COMMENT,
      },
    });

    if (existingLike) {
      // 이미 좋아요한 상태라면 취소
      await this.likeRepository.remove(existingLike);

      // 감사 로그 기록 (좋아요 취소)
      await this.auditService.logCommentAction(
        user.user_id,
        AuditAction.COMMENT_LIKE,
        id,
        { liked: true },
        { liked: false },
        { action: 'unlike' },
      );

      const likeCount = await this.likeRepository.count({
        where: { comment_id: id, type: LikeType.COMMENT, value: LikeValue.LIKE },
      });
      return {
        liked: false,
        likes: likeCount,
      };
    } else {
      // 좋아요하지 않은 상태라면 추가
      const like = this.likeRepository.create({
        user_id: user.user_id,
        comment_id: id,
        type: LikeType.COMMENT,
        value: LikeValue.LIKE,
      });
      await this.likeRepository.save(like);

      // 감사 로그 기록 (좋아요 추가)
      await this.auditService.logCommentAction(
        user.user_id,
        AuditAction.COMMENT_LIKE,
        id,
        { liked: false },
        { liked: true },
        { action: 'like' },
      );

      const likeCount = await this.likeRepository.count({
        where: { comment_id: id, type: LikeType.COMMENT, value: LikeValue.LIKE },
      });
      return {
        liked: true,
        likes: likeCount,
      };
    }
  }

  async getPostComments(
    postId: string,
    pagination: PaginationOptions = {},
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ post_id: postId, parent_only: true }, pagination);
  }

  async getUserComments(
    userId: string,
    pagination: PaginationOptions = {},
  ): Promise<{
    comments: Comment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ user_id: userId }, pagination);
  }

  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const comment = await this.commentRepository.findOne({
      where: { comment_id: commentId },
      relations: ['replies', 'replies.user'],
    });

    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }

    return comment.replies || [];
  }
}
