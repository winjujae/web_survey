import { Injectable } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class CsrfMiddleware {
  private isSafeMethod(method: string): boolean {
    return ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
  }

  private shouldBypass(path: string): boolean {
    // 인증 초기 단계나 토큰 발급/콜백은 CSRF 체크 제외
    return (
      path.startsWith('/api/auth/google') ||
      path === '/api/auth/csrf'
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path || '';
    if (this.isSafeMethod(req.method) || this.shouldBypass(path) === true) {
      return next();
    }

    // 인증 관련 엔드포인트에만 우선 적용 (확장 가능)
    if (!path.startsWith('/api/auth')) {
      return next();
    }

    const csrfCookie = (req as any)?.cookies?.['csrf_token'];
    const csrfHeader = req.header('X-CSRF-Token');

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    return next();
  }
}


