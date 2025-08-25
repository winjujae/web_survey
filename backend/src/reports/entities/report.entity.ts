import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  HATE_SPEECH = 'hate_speech',
  MISLEADING = 'misleading',
  OTHER = 'other'
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  report_id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  post_id?: string;

  @Column({ nullable: true })
  comment_id?: string;

  @Column({
    type: 'enum',
    enum: ReportReason
  })
  reason: ReportReason;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  status: ReportStatus;

  @Column({ type: 'text', nullable: true })
  admin_note?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, post => post.reports, { nullable: true })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, comment => comment.reports, { nullable: true })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
