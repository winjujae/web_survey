import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction, AuditResource } from '../entities/audit.entity';
import { WinstonLoggerService } from '../logger/winston.logger';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private readonly logger: WinstonLoggerService,
  ) {}

  async logAction(
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditRepository.create({
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        metadata: metadata || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

      await this.auditRepository.save(auditLog);

      // Winston 로거에도 기록
      this.logger.logAudit(action, resource, userId, {
        resourceId,
        oldValues,
        newValues,
        metadata,
        ipAddress,
      });
    } catch (error) {
      // 감사 로그 저장 실패 시에도 로깅
      this.logger.error('Failed to save audit log', error.stack, 'AuditService');
    }
  }

  // 사용자 관련 감사 로그
  async logUserAction(
    userId: string,
    action: AuditAction,
    resourceId?: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction(
      userId,
      action,
      AuditResource.USER,
      resourceId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    );
  }

  // 게시글 관련 감사 로그
  async logPostAction(
    userId: string,
    action: AuditAction,
    postId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction(
      userId,
      action,
      AuditResource.POST,
      postId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    );
  }

  // 댓글 관련 감사 로그
  async logCommentAction(
    userId: string,
    action: AuditAction,
    commentId: string,
    oldValues?: any,
    newValues?: any,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction(
      userId,
      action,
      AuditResource.COMMENT,
      commentId,
      oldValues,
      newValues,
      metadata,
      ipAddress,
      userAgent,
    );
  }

  // 인증 관련 감사 로그
  async logAuthAction(
    userId: string,
    action: AuditAction,
    metadata?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logAction(
      userId,
      action,
      AuditResource.AUTH,
      undefined,
      undefined,
      undefined,
      metadata,
      ipAddress,
      userAgent,
    );
  }

  // 감사 로그 조회 (관리자용)
  async getAuditLogs(
    userId?: string,
    action?: AuditAction,
    resource?: AuditResource,
    resourceId?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<[AuditLog[], number]> {
    const queryBuilder = this.auditRepository.createQueryBuilder('audit');

    if (userId) {
      queryBuilder.andWhere('audit.user_id = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('audit.action = :action', { action });
    }

    if (resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource });
    }

    if (resourceId) {
      queryBuilder.andWhere('audit.resource_id = :resourceId', { resourceId });
    }

    queryBuilder
      .orderBy('audit.created_at', 'DESC')
      .skip(offset)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  // 최근 감사 로그 조회
  async getRecentLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}

export { AuditAction, AuditResource };
