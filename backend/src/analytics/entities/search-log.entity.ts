import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum SearchType {
  POST = 'post',
  TAG = 'tag',
  USER = 'user'
}

@Entity('search_logs')
@Index(['search_term', 'searched_at'])
@Index(['user_id', 'searched_at'])
export class SearchLog {
  @PrimaryGeneratedColumn('uuid')
  search_log_id: string;

  @Column({ length: 255 })
  @Index()
  search_term: string;

  @Column({ nullable: true })
  @Index()
  user_id?: string;

  @Column({
    type: 'enum',
    enum: SearchType,
    default: SearchType.POST
  })
  search_type: SearchType;

  @Column({ default: 0 })
  result_count: number;

  @Column({ nullable: true })
  @Exclude()
  ip_hash?: string;

  @Column({ default: 1 })
  search_count: number;

  @CreateDateColumn()
  searched_at: Date;

  @UpdateDateColumn()
  last_searched_at: Date;
}
