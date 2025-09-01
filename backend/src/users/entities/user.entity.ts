import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Post } from '../../posts/entities/post.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Bookmark } from '../../bookmarks/entities/bookmark.entity';
import { Report } from '../../reports/entities/report.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Expert } from '../../experts/entities/expert.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  EXPERT = 'expert',
}

@Entity('users')
export class User {
  @ApiProperty({
    description: '사용자 고유 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @ApiProperty({
    description: '사용자 이메일 주소',
    example: 'user@example.com',
  })
  @Column({ unique: true, length: 100 })
  email: string;

  @ApiProperty({
    description: '사용자 비밀번호 (해시된 값)',
    example: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBpKmkp',
    writeOnly: true, // API 응답에서 제외
  })
  @Column({ length: 255 })
  password: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '탈모탈출러',
  })
  @Column({ unique: true, length: 50 })
  nickname: string;

  @ApiProperty({
    description: '사용자 역할',
    example: 'user',
    enum: UserRole,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @ApiPropertyOptional({
    description: '사용자 아바타 이미지 URL',
    example: 'https://example.com/avatar.jpg',
  })
  @Column({ nullable: true })
  avatar_url?: string;

  @ApiPropertyOptional({
    description: '사용자 자기소개',
    example: '탈모로 고민하다가 치료를 시작했습니다.',
  })
  @Column({ nullable: true })
  bio?: string;

  @ApiProperty({
    description: '계정 활성화 상태',
    example: true,
  })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({
    description: '계정 생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({
    description: '계정 수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Expert, (expert) => expert.user)
  expert_profiles: Expert[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
