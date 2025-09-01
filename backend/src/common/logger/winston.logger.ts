import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logDirectory = path.join(process.cwd(), 'logs');

// 로그 포맷 정의
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  }),
);

// 개발 환경용 콘솔 로거
const consoleTransport = new winston.transports.Console({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
});

// 파일 로거 (에러 로그)
const errorFileTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// 파일 로거 (전체 로그)
const combinedFileTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'combined-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// HTTP 요청 로거
const httpFileTransport = new DailyRotateFile({
  filename: path.join(logDirectory, 'http-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'http',
  maxSize: '20m',
  maxFiles: '14d',
  zippedArchive: true,
});

// Winston 로거 인스턴스 생성
export const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // 프로덕션에서는 파일만 사용, 개발에서는 콘솔도 사용
    ...(process.env.NODE_ENV === 'production' ? [] : [consoleTransport]),
    errorFileTransport,
    combinedFileTransport,
    httpFileTransport,
  ],
  // 예외 처리
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'exceptions.log'),
    }),
  ],
  // 프로세스 종료 시 처리되지 않은 예외 로깅
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDirectory, 'rejections.log'),
    }),
  ],
});

// NestJS LoggerService 인터페이스 구현
export class WinstonLoggerService {
  constructor(private context?: string) {}

  log(message: any, context?: string) {
    winstonLogger.info(message, {
      context: context || this.context,
      type: 'log',
    });
  }

  error(message: any, trace?: string, context?: string) {
    winstonLogger.error(message, {
      context: context || this.context,
      trace,
      type: 'error',
    });
  }

  warn(message: any, context?: string) {
    winstonLogger.warn(message, {
      context: context || this.context,
      type: 'warn',
    });
  }

  debug(message: any, context?: string) {
    winstonLogger.debug(message, {
      context: context || this.context,
      type: 'debug',
    });
  }

  verbose(message: any, context?: string) {
    winstonLogger.verbose(message, {
      context: context || this.context,
      type: 'verbose',
    });
  }

  // HTTP 요청 로깅용 메소드
  logHttpRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string) {
    winstonLogger.http('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      type: 'http_request',
    });
  }

  // 보안 이벤트 로깅용 메소드
  logSecurityEvent(event: string, details: any, userId?: string, ip?: string) {
    winstonLogger.warn('Security Event', {
      event,
      details,
      userId,
      ip,
      type: 'security',
    });
  }

  // 감사 로그용 메소드
  logAudit(action: string, resource: string, userId?: string, details?: any) {
    winstonLogger.info('Audit Log', {
      action,
      resource,
      userId,
      details,
      type: 'audit',
    });
  }
}
