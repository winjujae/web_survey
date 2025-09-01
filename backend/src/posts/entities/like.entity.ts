import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Post } from './post.entity';
import { Comment } from '../../comments/entities/comment.entity';

export enum LikeType {
  POST = 'post',
  COMMENT = 'comment'
}

export enum LikeValue {
  LIKE = 1,
  DISLIKE = -1
}

@Entity('likes')
@Unique(['user_id', 'post_id', 'comment_id'])
export class Like {
  @PrimaryGeneratedColumn('uuid')
  like_id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({ nullable: true })
  @Index()
  post_id?: string;

  @Column({ nullable: true })
  @Index()
  comment_id?: string;

  @Column({
    type: 'enum',
    enum: LikeType,
    comment: '좋아요 대상 타입'
  })
  type: LikeType;

  @Column({
    type: 'enum',
    enum: LikeValue,
    default: LikeValue.LIKE,
    comment: '좋아요 값 (1: 좋아요, -1: 싫어요)'
  })
  value: LikeValue;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, user => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, post => post.likes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, comment => comment.likes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'comment_id' })
  comment: Comment;
}
