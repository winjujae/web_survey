import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

export enum CategoryType {
  GENERAL = 'general',
  HOSPITAL = 'hospital',
  PRODUCT = 'product',
  EXPERT_QNA = 'expert_qna',
  HAIR_LOSS = 'hair_loss',
  TREATMENT = 'treatment',
  LIFESTYLE = 'lifestyle'
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.GENERAL
  })
  type: CategoryType;

  @Column({ nullable: true })
  icon_url?: string;

  @Column({ default: 0 })
  post_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Post, post => post.category)
  posts: Post[];
}
