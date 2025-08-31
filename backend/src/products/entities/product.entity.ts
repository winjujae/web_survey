import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';

export enum ProductCategory {
  SHAMPOO = 'shampoo',
  CONDITIONER = 'conditioner',
  HAIR_LOSS_TREATMENT = 'hair_loss_treatment',
  HAIR_GROWTH_SUPPLEMENT = 'hair_growth_supplement',
  HAIR_TRANSPLANT_PRODUCT = 'hair_transplant_product',
  HAIR_ACCESSORY = 'hair_accessory',
  OTHER = 'other',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column({ length: 200 })
  name: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category: ProductCategory;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  ingredients?: string;

  @Column({ type: 'text', nullable: true })
  usage_instructions?: string;

  @Column({ nullable: true })
  brand?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  review_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ length: 500, nullable: true })
  purchase_url?: string;

  @Column({ type: 'json', nullable: true })
  side_effects?: string[];

  @Column({ type: 'json', nullable: true })
  contraindications?: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}
