import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  Index,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { PostTag } from './post-tag.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  tag_id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  usage_count: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // 다대다 관계: Post와의 관계
  @ManyToMany(() => Post, post => post.tags)
  posts: Post[];

  // PostTag 관계
  @OneToMany(() => PostTag, postTag => postTag.tag)
  post_tags: PostTag[];
}
