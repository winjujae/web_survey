import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';

export enum ReviewType {
  PRODUCT = 'product',
  HOSPITAL = 'hospital',
}

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  review_id: string;

  @Column()
  user_id: string;

  @Column({ nullable: true })
  product_id?: string;

  @Column({ nullable: true })
  hospital_id?: string;

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  type: ReviewType;

  @Column({ type: 'text' })
  content: string;

  @Column('int')
  rating: number;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ default: 0 })
  helpful_count: number;

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  admin_response?: string;

  @Column({ nullable: true })
  admin_response_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Hospital, (hospital) => hospital.reviews, { nullable: true })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;
}
