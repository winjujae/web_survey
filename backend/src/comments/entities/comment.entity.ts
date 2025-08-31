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
import { Post } from '../../posts/entities/post.entity';
import { Report } from '../../reports/entities/report.entity';

export enum CommentStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  comment_id: string;

  @Column()
  post_id: string;

  @Column()
  user_id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  parent_comment_id?: string;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.ACTIVE,
  })
  status: CommentStatus;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: true })
  is_anonymous: boolean;

  @Column({ nullable: true })
  anonymous_nickname?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  @JoinColumn({ name: 'parent_comment_id' })
  parent_comment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent_comment)
  replies: Comment[];

  @OneToMany(() => Report, (report) => report.comment)
  reports: Report[];
}
