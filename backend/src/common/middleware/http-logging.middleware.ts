import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from '../logger/winston.logger';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl: url, ip, headers } = req;

    // 요청 로깅
    this.logger.logHttpRequest(method, url, 0, 0, this.extractUserId(req));

    // 응답 완료 시 로깅
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.logHttpRequest(
        method,
        url,
        statusCode,
        responseTime,
        this.extractUserId(req),
      );

      // 에러 응답 로깅
      if (statusCode >= 400) {
        this.logger.logSecurityEvent(
          'HTTP_ERROR_RESPONSE',
          {
            method,
            url,
            statusCode,
            responseTime,
            userAgent: headers['user-agent'],
            referer: headers.referer,
          },
          this.extractUserId(req),
          ip,
        );
      }
    });

    // 응답 에러 시 로깅
    res.on('error', (error) => {
      const responseTime = Date.now() - startTime;

      this.logger.logSecurityEvent(
        'HTTP_RESPONSE_ERROR',
        {
          method,
          url,
          error: error.message,
          responseTime,
          stack: error.stack,
        },
        this.extractUserId(req),
        ip,
      );
    });

    next();
  }

  private extractUserId(req: Request): string | undefined {
    // JWT 토큰에서 사용자 ID 추출 (실제 구현에서는 JWT 디코딩 필요)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // 실제로는 JWT 토큰을 디코딩해서 userId 추출
      // 여기서는 임시로 undefined 반환
      return undefined;
    }
    return undefined;
  }
}
