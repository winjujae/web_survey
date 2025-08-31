import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { Comment, CommentStatus } from '../comments/entities/comment.entity';
import { Bookmark } from '../bookmarks/entities/bookmark.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface UserProfile {
  user_id: string;
  email: string;
  nickname: string;
  bio?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  _count?: {
    posts: number;
    comments: number;
    bookmarks: number;
  };
}

export interface UserStats {
  total_posts: number;
  total_comments: number;
  total_bookmarks: number;
  posts_this_month: number;
  comments_this_month: number;
  likes_received: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, nickname, ...userData } = createUserDto;

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { nickname }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
      if (existingUser.nickname === nickname) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    const user = this.userRepository.create({
      ...userData,
      email,
      nickname,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: [
        'user_id',
        'email',
        'nickname',
        'role',
        'is_active',
        'created_at',
        'updated_at',
      ],
      where: { is_active: true },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: id, is_active: true },
      select: [
        'user_id',
        'email',
        'nickname',
        'bio',
        'avatar_url',
        'role',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, is_active: true },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { nickname, is_active: true },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User,
  ): Promise<User> {
    const user = await this.findOne(id);

    // 본인 또는 관리자 확인
    if (user.user_id !== currentUser.user_id && currentUser.role !== 'admin') {
      throw new ForbiddenException('사용자 정보를 수정할 권한이 없습니다.');
    }

    // 닉네임 중복 확인
    if (
      updateUserDto.nickname !== undefined &&
      updateUserDto.nickname !== user.nickname
    ) {
      const existingUser = await this.userRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });

      if (existingUser && existingUser.user_id !== id) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      updated_at: new Date(),
    });

    return this.findOne(id);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id);

    // 본인 또는 관리자 확인
    if (user.user_id !== currentUser.user_id && currentUser.role !== 'admin') {
      throw new ForbiddenException('사용자 계정을 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제
    await this.userRepository.update(id, {
      is_active: false,
      updated_at: new Date(),
    });
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId, is_active: true },
      select: [
        'user_id',
        'email',
        'nickname',
        'bio',
        'avatar_url',
        'role',
        'is_active',
        'created_at',
        'updated_at',
      ],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자 통계 계산
    const [postsCount, commentsCount, bookmarksCount] = await Promise.all([
      this.postRepository.count({
        where: { user_id: userId, status: PostStatus.PUBLISHED },
      }),
      this.commentRepository.count({
        where: { user_id: userId, status: CommentStatus.ACTIVE },
      }),
      this.bookmarkRepository.count({ where: { user_id: userId } }),
    ]);

    return {
      ...user,
      _count: {
        posts: postsCount,
        comments: commentsCount,
        bookmarks: bookmarksCount,
      },
    };
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 전체 통계
    const [totalPosts, totalComments, totalBookmarks] = await Promise.all([
      this.postRepository.count({
        where: { user_id: userId, status: PostStatus.PUBLISHED },
      }),
      this.commentRepository.count({
        where: { user_id: userId, status: CommentStatus.ACTIVE },
      }),
      this.bookmarkRepository.count({ where: { user_id: userId } }),
    ]);

    // 이번 달 통계
    const [postsThisMonth, commentsThisMonth] = await Promise.all([
      this.postRepository.count({
        where: {
          user_id: userId,
          status: PostStatus.PUBLISHED,
          created_at: { $gte: startOfMonth } as any,
        },
      }),
      this.commentRepository.count({
        where: {
          user_id: userId,
          status: CommentStatus.ACTIVE,
          created_at: { $gte: startOfMonth } as any,
        },
      }),
    ]);

    // 받은 좋아요 수 계산
    const [postLikes, commentLikes] = await Promise.all([
      this.postRepository
        .createQueryBuilder('post')
        .select('SUM(post.likes)', 'total')
        .where('post.user_id = :userId', { userId })
        .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
        .getRawOne(),
      this.commentRepository
        .createQueryBuilder('comment')
        .select('SUM(comment.likes)', 'total')
        .where('comment.user_id = :userId', { userId })
        .andWhere('comment.status = :status', { status: CommentStatus.ACTIVE })
        .getRawOne(),
    ]);

    const likesReceived =
      (parseInt(postLikes?.total || '0', 10) || 0) +
      (parseInt(commentLikes?.total || '0', 10) || 0);

    return {
      total_posts: totalPosts,
      total_comments: totalComments,
      total_bookmarks: totalBookmarks,
      posts_this_month: postsThisMonth,
      comments_this_month: commentsThisMonth,
      likes_received: likesReceived,
    };
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 10) {
    await this.findOne(userId); // 사용자 존재 확인

    const [posts, total] = await this.postRepository.findAndCount({
      where: { user_id: userId, status: PostStatus.PUBLISHED },
      relations: ['category'],
      select: {
        post_id: true,
        title: true,
        content: true,
        image_urls: true,
        likes: true,
        dislikes: true,
        view_count: true,
        created_at: true,
        updated_at: true,
        category: {
          category_id: true,
          name: true,
        },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getUserComments(userId: string, page: number = 1, limit: number = 10) {
    await this.findOne(userId); // 사용자 존재 확인

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { user_id: userId, status: CommentStatus.ACTIVE },
      relations: ['post'],
      select: {
        comment_id: true,
        content: true,
        likes: true,
        created_at: true,
        updated_at: true,
        post: {
          post_id: true,
          title: true,
        },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getUserBookmarks(userId: string, page: number = 1, limit: number = 10) {
    await this.findOne(userId); // 사용자 존재 확인

    const [bookmarks, total] = await this.bookmarkRepository.findAndCount({
      where: { user_id: userId },
      relations: ['post', 'post.user', 'post.category'],
      select: {
        bookmark_id: true,
        created_at: true,
        post: {
          post_id: true,
          title: true,
          content: true,
          image_urls: true,
          likes: true,
          view_count: true,
          created_at: true,
          user: {
            user_id: true,
            nickname: true,
          },
          category: {
            category_id: true,
            name: true,
          },
        },
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      bookmarks: bookmarks.map((bookmark) => bookmark.post),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
}
