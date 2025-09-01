import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // HttpException 처리
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        error = responseObj.error || error;
      }
    }
    // TypeORM QueryFailedError 처리
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Database query failed';
      error = 'Bad Request';

      // 구체적인 데이터베이스 에러 메시지
      if (exception.message.includes('duplicate key value')) {
        message = '중복된 데이터가 존재합니다.';
      } else if (exception.message.includes('violates foreign key constraint')) {
        message = '참조 무결성 제약조건을 위반했습니다.';
      } else if (exception.message.includes('violates not-null constraint')) {
        message = '필수 필드가 누락되었습니다.';
      }
    }
    // 기타 예외 처리
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // 프로덕션 환경에서는 상세한 에러 정보 숨김
    const isProduction = process.env.NODE_ENV === 'production';
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(isProduction ? {} : { error, message }), // 프로덕션에서는 메시지 숨김
    };

    // 에러 로깅
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json(errorResponse);
  }
}
