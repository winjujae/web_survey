import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExpertCategory {
  DERMATOLOGIST = 'dermatologist',
  HAIR_SPECIALIST = 'hair_specialist',
  NUTRITIONIST = 'nutritionist',
  PSYCHOLOGIST = 'psychologist',
  GENERAL_PRACTITIONER = 'general_practitioner'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn('uuid')
  expert_id: string;

  @Column()
  user_id: string;

  @Column({ unique: true, length: 50 })
  license_number: string;

  @Column({
    type: 'enum',
    enum: ExpertCategory
  })
  category: ExpertCategory;

  @Column({ type: 'text' })
  profile_info: string;

  @Column({ type: 'json', nullable: true })
  qualifications?: string[];

  @Column({ type: 'json', nullable: true })
  certifications?: string[];

  @Column({ nullable: true })
  hospital_affiliation?: string;

  @Column({ nullable: true })
  years_of_experience?: number;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING
  })
  verified: VerificationStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  consultation_count: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => User, user => user.expert_profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
