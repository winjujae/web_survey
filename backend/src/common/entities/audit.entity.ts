import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  POST_LIKE = 'POST_LIKE',
  COMMENT_LIKE = 'COMMENT_LIKE',
  REPORT = 'REPORT',
}

export enum AuditResource {
  USER = 'USER',
  POST = 'POST',
  COMMENT = 'COMMENT',
  BOOKMARK = 'BOOKMARK',
  REPORT = 'REPORT',
  AUTH = 'AUTH',
}

@Entity('audit_logs')
@Index(['user_id', 'created_at'])
@Index(['resource', 'resource_id'])
@Index(['action', 'created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  audit_id: string;

  @Column()
  @Index()
  user_id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
    comment: '수행된 액션'
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditResource,
    comment: '대상 리소스 타입'
  })
  resource: AuditResource;

  @Column({ nullable: true, comment: '리소스 ID' })
  resource_id?: string;

  @Column({ type: 'json', nullable: true, comment: '변경 전 데이터' })
  old_values?: any;

  @Column({ type: 'json', nullable: true, comment: '변경 후 데이터' })
  new_values?: any;

  @Column({ type: 'json', nullable: true, comment: '추가 메타데이터' })
  metadata?: any;

  @Column({ nullable: true, comment: '클라이언트 IP 주소' })
  ip_address?: string;

  @Column({ nullable: true, comment: 'User-Agent' })
  user_agent?: string;

  @CreateDateColumn()
  created_at: Date;
}
