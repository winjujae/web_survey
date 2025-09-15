import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { Tag } from './tag.entity';

@Entity('post_tags')
@Unique(['post_id', 'tag_id']) // 중복 태그 방지
export class PostTag {
  @PrimaryGeneratedColumn('uuid')
  post_tag_id: string;

  @Column()
  @Index()
  post_id: string;

  @Column()
  @Index()
  tag_id: string;

  @CreateDateColumn()
  created_at: Date;

  // 관계 설정
  @ManyToOne(() => Post, post => post.post_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Tag, tag => tag.post_tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;
}
