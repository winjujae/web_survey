import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { Report } from '../../reports/entities/report.entity';
import { Category } from '../../categories/entities/category.entity';
import { Like } from './like.entity';

// Tag 관련 임포트
import { Tag } from '../../tags/entities/tag.entity';
import { PostTag } from '../../tags/entities/post-tag.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum PostType {
  GENERAL = 'general',
  ANONYMOUS = 'anonymous',
  HOSPITAL = 'hospital',
  PRODUCT = 'product',
  EXPERT_QNA = 'expert_qna',
}

@Entity('posts')
export class Post {
  @ApiProperty({
    description: '게시글 고유 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  post_id: string;

  @ApiProperty({
    description: '작성자 사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column()
  user_id: string;

  @ApiProperty({
    description: '게시글 제목',
    example: '미녹시딜 3개월차 변화 공유합니다',
  })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({
    description: '게시글 본문',
    example: '미녹시딜 사용 후 3개월간의 변화를 공유합니다.',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiPropertyOptional({
    description: '이미지 URL 목록',
    type: [String],
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @Column({ type: 'json', nullable: true })
  image_urls?: string[];

  @ApiPropertyOptional({
    description: '카테고리 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ nullable: true })
  category_id?: string;

  @ApiProperty({
    description: '게시글 상태',
    enum: PostStatus,
    example: PostStatus.PUBLISHED,
  })
  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @ApiProperty({
    description: '게시글 유형',
    enum: PostType,
    example: PostType.GENERAL,
  })
  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.GENERAL,
  })
  type: PostType;

  @ApiProperty({
    description: '좋아요 수',
    example: 15,
  })
  // 좋아요 수는 Like 엔티티에서 계산 (읽기 전용)
  likes_count: number;

  @ApiProperty({
    description: '싫어요 수',
    example: 2,
  })
  // 싫어요 수는 Like 엔티티에서 계산 (읽기 전용)
  dislikes: number;

  @ApiProperty({
    description: '조회수',
    example: 150,
  })
  @Column({ default: 0 })
  view_count: number;

  @ApiProperty({
    description: '익명 여부',
    example: false,
  })
  @Column({ default: true })
  is_anonymous: boolean;

  @ApiPropertyOptional({
    description: '익명 닉네임',
    example: '익명사용자',
  })
  @Column({ nullable: true })
  anonymous_nickname?: string;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ApiPropertyOptional({
    description: '작성자 정보',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiPropertyOptional({
    description: '카테고리 정보',
    type: () => Category,
  })
  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiPropertyOptional({
    description: '댓글 목록',
    type: () => [Comment],
  })
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ApiPropertyOptional({
    description: '북마크 목록',
    type: () => [Bookmark],
  })
  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark[];

  @ApiPropertyOptional({
    description: '신고 목록',
    type: () => [Report],
  })
  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];

  @ApiPropertyOptional({
    description: '좋아요/싫어요 목록',
    type: () => [Like],
  })
  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  // Tag 관계
  @ApiPropertyOptional({
    description: '태그 목록',
    type: () => [Tag],
  })
  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'post_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' }
  })
  tags: Tag[];

  @ApiPropertyOptional({
    description: '게시글-태그 관계 목록',
    type: () => [PostTag],
  })
  @OneToMany(() => PostTag, postTag => postTag.post)
  post_tags: PostTag[];
}
