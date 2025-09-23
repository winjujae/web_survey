import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { NestKakaoStrategy } from './strategies/kakao.strategy';

import { SessionSerializer } from './serializer/serializer';

// Kakao 전략을 ConfigService 초기화 이후에 조건부로 인스턴스화
const KakaoStrategyProvider = {
  provide: NestKakaoStrategy,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const clientId = configService.get<string>('KAKAO_CLIENT_ID');
    if (!clientId) {
      return undefined as unknown as NestKakaoStrategy;
    }
    return new NestKakaoStrategy();
  },
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleStrategy,
    KakaoStrategyProvider,
    SessionSerializer,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, PassportModule, JwtModule, GoogleStrategy],
})
export class AuthModule {}
