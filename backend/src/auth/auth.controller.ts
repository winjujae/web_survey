import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  UseGuards,
  Request,
  Response,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { GoogleAuthGuard } from './guards/Google.auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: TokenDto })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 닉네임' })
  async register(@Body() registerDto: RegisterDto, @Response() res: any): Promise<void> {
    const tokens = await this.authService.register(registerDto);
    this.setAuthCookies(res, tokens);
    res.status(HttpStatus.CREATED).json({ success: true });
  }

  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '이메일과 비밀번호로 로그인합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공', type: TokenDto })
  @ApiResponse({
    status: 401,
    description: '이메일 또는 비밀번호가 올바르지 않음',
  })
  async login(@Body() loginDto: LoginDto, @Response() res: any): Promise<void> {
    const tokens = await this.authService.login(loginDto);
    this.setAuthCookies(res, tokens);
    res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('refresh')
  @UseGuards(AuthGuard('refresh-token'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: TokenDto })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async refresh(@Request() req: any, @Response() res: any): Promise<void> {
    const user = req.user as User;
    const tokens = await this.authService.refreshToken(user);
    this.setAuthCookies(res, tokens);
    res.status(HttpStatus.OK).json({ success: true });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자를 로그아웃 처리합니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async logout(@Response() res: any): Promise<void> {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' as const, path: '/' };
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
    res.status(HttpStatus.OK).json({ message: '로그아웃되었습니다.' });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '프로필 조회',
    description: '현재 로그인된 사용자의 프로필 정보를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '프로필 조회 성공', type: User })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async getProfile(@Request() req: any): Promise<User> {
    const user = req.user as User;
    return this.authService.getProfile(user);
  }

  @Get('session')
  @ApiOperation({ summary: '세션 상태 조회(항상 200)' })
  async session(@Request() req: any) {
    try {
      const token = req?.cookies?.access_token;
      if (!token) {
        return { authenticated: false, user: null };
      }
      const payload: any = this.jwtService.verify(token);
      const user = await this.authService.findUser(payload?.sub);
      if (!user) return { authenticated: false, user: null };
      return {
        authenticated: true,
        user: {
          user_id: user.user_id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      };
    } catch {
      return { authenticated: false, user: null };
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '프로필 수정',
    description: '현재 로그인된 사용자의 프로필 정보를 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '프로필 수정 성공', type: User })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  @ApiResponse({ status: 409, description: '이미 사용 중인 닉네임' })
  async updateProfile(
    @Request() req: any,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    const user = req.user as User;
    return this.authService.updateProfile(user, updateData);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 OAuth 로그인을 시작합니다.',
  })
  async handleGoogleLogin() {
    // GoogleAuthGuard에서 자동으로 구글 로그인 페이지로 리다이렉트
    return { message: '구글 로그인 페이지로 리다이렉트합니다.' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: '구글 로그인 콜백',
    description: '구글 OAuth 콜백을 처리하고 JWT 토큰을 발급합니다.',
  })
  async handleGoogleCallback(@Request() req: any, @Response() res: any) {
    try {
      // Passport에서 받은 구글 사용자 정보
      const googleUserInfo = req.user;
      
      if (!googleUserInfo) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=구글 인증에 실패했습니다.`);
      }

      // DB에서 사용자 찾기/생성
      const user = await this.authService.findOrCreateGoogleUser(googleUserInfo);
      
      // JWT 토큰 발급 및 쿠키 설정
      const tokens = await this.authService.generateTokens(user);
      this.setAuthCookies(res, tokens);

      // 토큰을 노출하지 않고 안전 리다이렉트
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/callback`);
    } catch (error) {
      console.error('구글 콜백 처리 실패:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontendUrl}/auth/error?message=로그인 처리 중 오류가 발생했습니다.`);
    }
  }

  @Get('csrf')
  @ApiOperation({ summary: 'CSRF 토큰 발급' })
  async issueCsrf(@Response() res: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const csrf = Math.random().toString(36).slice(2);
    res.cookie('csrf_token', csrf, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/',
      maxAge: 2 * 60 * 60 * 1000,
    });
    res.status(HttpStatus.OK).json({ csrfToken: csrf });
  }

  private setAuthCookies(res: any, tokens: TokenDto) {
    const isProd = process.env.NODE_ENV === 'production';
    const cookieBase = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax' as const,
      path: '/',
    };

    const parseTtl = (val?: string): number => {
      if (!val) return 15 * 60 * 1000; // default 15m
      const m = String(val).match(/^(\d+)([smhd])$/i);
      if (!m) {
        const n = Number(val);
        return Number.isFinite(n) ? n * 1000 : 15 * 60 * 1000;
      }
      const num = parseInt(m[1], 10);
      const unit = m[2].toLowerCase();
      switch (unit) {
        case 's': return num * 1000;
        case 'm': return num * 60 * 1000;
        case 'h': return num * 60 * 60 * 1000;
        case 'd': return num * 24 * 60 * 60 * 1000;
        default: return 15 * 60 * 1000;
      }
    };

    res.cookie('access_token', tokens.access_token, {
      ...cookieBase,
      maxAge: parseTtl(process.env.JWT_EXPIRES_IN),
    });
    res.cookie('refresh_token', tokens.refresh_token, {
      ...cookieBase,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}
