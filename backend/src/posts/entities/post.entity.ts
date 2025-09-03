import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
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
  @PrimaryGeneratedColumn('uuid')
  post_id: string;

  @Column()
  user_id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  image_urls?: string[];

  @Column({ nullable: true })
  category_id?: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.GENERAL,
  })
  type: PostType;

  // 좋아요 수는 Like 엔티티에서 계산 (읽기 전용)
  likes_count: number;

  // 싫어요 수는 Like 엔티티에서 계산 (읽기 전용)
  dislikes: number;

  @Column({ default: 0 })
  view_count: number;

  @Column({ default: true })
  is_anonymous: boolean;

  @Column({ nullable: true })
  anonymous_nickname?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category, (category) => category.posts, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.post)
  bookmarks: Bookmark[];

  @OneToMany(() => Report, (report) => report.post)
  reports: Report[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  // Tag 관계
  @ManyToMany(() => Tag, tag => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'post_id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'tag_id' }
  })
  tags: Tag[];

  @OneToMany(() => PostTag, postTag => postTag.post)
  post_tags: PostTag[];
}
