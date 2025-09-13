import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { WinstonLoggerService } from './common/logger/winston.logger';
import { HttpLoggingMiddleware } from './common/middleware/http-logging.middleware';


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Winston 로거 설정
  const winstonLogger = new WinstonLoggerService('Application');
  app.useLogger(winstonLogger);

  // HTTP 로깅 미들웨어 적용
  const httpLogger = new HttpLoggingMiddleware(winstonLogger);
  app.use(httpLogger.use.bind(httpLogger));

  // 보안 미들웨어 설정
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  // CORS 설정 강화
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com'] // 프로덕션에서는 특정 도메인만 허용
      : true, // 개발에서는 모든 오리진 허용
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 글로벌 유효성 검증 파이프
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 에러
    transform: true, // 요청 데이터를 DTO 타입으로 변환
    disableErrorMessages: process.env.NODE_ENV === 'production', // 프로덕션에서는 상세 에러 메시지 숨김
  }));

  // 글로벌 예외 필터
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('탈모 커뮤니티 플랫폼 API')
    .setDescription(
      '탈모로 고민하는 사람들이 정보를 공유하고 소통할 수 있는 커뮤니티 플랫폼 API',
    )
    .setVersion('1.0')
    .addTag('auth', '인증 관련 API')
    .addTag('users', '사용자 관리 API')
    .addTag('posts', '게시글 관리 API')
    .addTag('comments', '댓글 관리 API')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3300);
}
bootstrap();
