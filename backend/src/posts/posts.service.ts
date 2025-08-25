import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, SelectQueryBuilder } from 'typeorm';
import { Post, PostStatus, PostType } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

export interface PostFilters {
  category_id?: string;
  type?: PostType;
  status?: PostStatus;
  search?: string;
  user_id?: string;
  is_anonymous?: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'updated_at' | 'likes' | 'view_count';
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User): Promise<Post> {
    const { category_id, ...postData } = createPostDto;

    // 카테고리 확인
    let category: Category | null = null;
    if (category_id) {
      category = await this.categoryRepository.findOne({
        where: { category_id, is_active: true },
      });
      if (!category) {
        throw new BadRequestException('존재하지 않는 카테고리입니다.');
      }
    }

    // 게시글 생성
    const post = this.postRepository.create({
      ...postData,
      user_id: user.user_id,
      category_id: category?.category_id,
    });

    return this.postRepository.save(post);
  }

  async findAll(filters: PostFilters = {}, pagination: PaginationOptions = {}): Promise<{
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = pagination;

    const queryBuilder = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.is_active = :isActive', { isActive: true });

    // 필터 적용
    if (filters.category_id) {
      queryBuilder.andWhere('post.category_id = :categoryId', {
        categoryId: filters.category_id,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere('post.type = :type', { type: filters.type });
    }

    if (filters.user_id) {
      queryBuilder.andWhere('post.user_id = :userId', { userId: filters.user_id });
    }

    if (filters.is_anonymous !== undefined) {
      queryBuilder.andWhere('post.is_anonymous = :isAnonymous', {
        isAnonymous: filters.is_anonymous,
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // 정렬
    queryBuilder.orderBy(`post.${sortBy}`, sortOrder);

    // 페이지네이션
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [posts, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string, user?: User): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { post_id: id },
      relations: ['user', 'category', 'comments', 'bookmarks', 'reports'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 비공개 게시글은 작성자만 볼 수 있음
    if (post.status !== PostStatus.PUBLISHED && post.user_id !== user?.user_id) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 조회수 증가 (본인 게시글은 제외)
    if (user?.user_id !== post.user_id) {
      await this.postRepository.increment({ post_id: id }, 'view_count', 1);
      post.view_count += 1;
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id, user);

    // 작성자 확인
    if (post.user_id !== user.user_id) {
      throw new ForbiddenException('게시글을 수정할 권한이 없습니다.');
    }

    const { category_id, ...updateData } = updatePostDto;

    // 카테고리 확인
    if (category_id) {
      const category = await this.categoryRepository.findOne({
        where: { category_id, is_active: true },
      });
      if (!category) {
        throw new BadRequestException('존재하지 않는 카테고리입니다.');
      }
    }

    await this.postRepository.update(id, {
      ...updateData,
      category_id,
      updated_at: new Date(),
    });

    return this.findOne(id, user);
  }

  async remove(id: string, user: User): Promise<void> {
    const post = await this.findOne(id, user);

    // 작성자 또는 관리자 확인
    if (post.user_id !== user.user_id && user.role !== 'admin') {
      throw new ForbiddenException('게시글을 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제
    await this.postRepository.update(id, {
      status: PostStatus.DELETED,
      updated_at: new Date(),
    });
  }

  async toggleLike(id: string, user: User): Promise<{ liked: boolean; likes: number }> {
    const post = await this.postRepository.findOne({
      where: { post_id: id },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 간단한 좋아요 토글 로직 (실제로는 별도의 likes 테이블이 필요할 수 있음)
    const liked = post.likes > 0; // 실제로는 사용자별 좋아요 상태를 확인해야 함

    if (liked) {
      post.likes -= 1;
    } else {
      post.likes += 1;
    }

    await this.postRepository.save(post);

    return {
      liked: !liked,
      likes: post.likes,
    };
  }

  async toggleBookmark(id: string, user: User): Promise<{ bookmarked: boolean }> {
    // 북마크 로직은 BookmarksModule에서 구현
    return { bookmarked: false };
  }

  async getUserPosts(userId: string, pagination: PaginationOptions = {}): Promise<{
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll(
      { user_id: userId, status: PostStatus.PUBLISHED },
      pagination,
    );
  }
}
