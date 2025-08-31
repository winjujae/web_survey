import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
