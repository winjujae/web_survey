import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { PostTag } from './entities/post-tag.entity';
import { AnalyticsService } from '../analytics/analytics.service';
import { SearchType } from '../analytics/entities/search-log.entity';
import { PostsService } from '../posts/posts.service';

export interface TagRanking {
  tag_id: string;
  name: string;
  usage_count: number;
  rank: number;
}

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(PostTag)
    private postTagRepository: Repository<PostTag>,
    private analyticsService: AnalyticsService,
  ) {}

  // 태그 생성
  async create(name: string, description?: string): Promise<Tag> {
    // 중복 태그 체크
    const existingTag = await this.tagRepository.findOne({ where: { name } });
    if (existingTag) {
      throw new ConflictException('이미 존재하는 태그입니다.');
    }

    const tag = this.tagRepository.create({
      name,
      description,
      usage_count: 0,
    });

    return this.tagRepository.save(tag);
  }

  // 태그 조회 (ID로)
  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { tag_id: id, is_active: true },
      relations: ['posts'],
    });

    if (!tag) {
      throw new NotFoundException('태그를 찾을 수 없습니다.');
    }

    return tag;
  }

  // 태그 조회 (이름으로)
  async findByName(name: string): Promise<Tag | null> {
    return this.tagRepository.findOne({
      where: { name, is_active: true },
    });
  }

  // 모든 태그 조회
  async findAll(limit?: number, offset?: number): Promise<Tag[]> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.is_active = :isActive', { isActive: true })
      .orderBy('tag.usage_count', 'DESC')
      .addOrderBy('tag.created_at', 'DESC');

    if (limit) {
      query.limit(limit);
    }
    if (offset) {
      query.offset(offset);
    }

    return query.getMany();
  }

  // 태그 검색
  async searchTags(query: string, limit: number = 10, userId?: string, ip?: string): Promise<Tag[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.is_active = :isActive', { isActive: true })
      .andWhere('tag.name ILIKE :query', { query: `%${query}%` })
      .orderBy('tag.usage_count', 'DESC')
      .limit(limit)
      .getMany();

    // 태그 검색 로깅 (비동기)
    if (tags.length > 0) {
      setImmediate(() => {
        this.analyticsService.logSearch(
          query,
          SearchType.TAG,
          userId,
          tags.length,
          ip
        );
      });
    }

    return tags;
  }

  // 태그별 게시물 조회
  async getPostsByTag(tagId: string, page: number = 1, limit: number = 10) {
    const tag = await this.findOne(tagId);

    // 직접 쿼리로 구현 (순환 참조 방지)
    const offset = (page - 1) * limit;

    const [posts, total] = await this.postTagRepository
      .createQueryBuilder('pt')
      .innerJoin('pt.post', 'post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.category', 'category')
      .where('pt.tag_id = :tagId', { tagId })
      .andWhere('post.status = :status', { status: 'published' })
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    };
  }

  // 태그 랭킹 조회
  async getTagRanking(limit: number = 10): Promise<TagRanking[]> {
    const tags = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.is_active = :isActive', { isActive: true })
      .andWhere('tag.usage_count > 0')
      .orderBy('tag.usage_count', 'DESC')
      .addOrderBy('tag.created_at', 'DESC')
      .limit(limit)
      .getMany();

    return tags.map((tag, index) => ({
      tag_id: tag.tag_id,
      name: tag.name,
      usage_count: tag.usage_count,
      rank: index + 1,
    }));
  }

  // 게시물에 태그 추가
  async addTagsToPost(postId: string, tagNames: string[]): Promise<void> {
    // 태그들을 생성하거나 조회
    const tags: Tag[] = [];
    for (const tagName of tagNames) {
      let tag = await this.findByName(tagName);
      if (!tag) {
        tag = await this.create(tagName);
      }
      tags.push(tag);
    }

    // 기존 PostTag 관계 제거
    await this.postTagRepository.delete({ post_id: postId });

    // 새로운 PostTag 관계 생성
    const postTags = tags.map(tag => ({
      post_id: postId,
      tag_id: tag.tag_id,
    }));

    await this.postTagRepository.save(postTags);

    // 태그 사용 횟수 업데이트
    await this.updateTagUsageCounts(tags.map(tag => tag.tag_id));
  }

  // 게시물에서 태그 제거
  async removeTagsFromPost(postId: string, tagIds: string[]): Promise<void> {
    await this.postTagRepository.delete({
      post_id: postId,
      tag_id: In(tagIds),
    });

    // 태그 사용 횟수 업데이트
    await this.updateTagUsageCounts(tagIds);
  }

  // 태그 사용 횟수 업데이트
  private async updateTagUsageCounts(tagIds: string[]): Promise<void> {
    for (const tagId of tagIds) {
      const count = await this.postTagRepository.count({
        where: { tag_id: tagId },
      });

      await this.tagRepository.update(tagId, { usage_count: count });
    }
  }

  // 태그 삭제 (비활성화)
  async delete(id: string): Promise<void> {
    const tag = await this.findOne(id);

    // 태그 비활성화
    await this.tagRepository.update(id, { is_active: false });

    // 관련 PostTag 관계 제거
    await this.postTagRepository.delete({ tag_id: id });
  }

  // 태그 통계
  async getTagStats() {
    const totalTags = await this.tagRepository.count({
      where: { is_active: true },
    });

    const totalUsage = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.is_active = :isActive', { isActive: true })
      .select('SUM(tag.usage_count)', 'total')
      .getRawOne();

    const mostUsedTag = await this.tagRepository
      .createQueryBuilder('tag')
      .where('tag.is_active = :isActive', { isActive: true })
      .andWhere('tag.usage_count > 0')
      .orderBy('tag.usage_count', 'DESC')
      .getOne();

    return {
      total_tags: totalTags,
      total_usage: parseInt(totalUsage?.total || '0'),
      most_used_tag: mostUsedTag,
    };
  }
}
