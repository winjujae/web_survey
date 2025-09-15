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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/entities/user.entity';
import { GoogleAuthGuard } from './guards/Google.auth.guard';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공', type: TokenDto })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터' })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일 또는 닉네임' })
  async register(@Body() registerDto: RegisterDto): Promise<TokenDto> {
    return this.authService.register(registerDto);
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
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '토큰 갱신',
    description: '리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.',
  })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공', type: TokenDto })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  async refresh(@Request() req: any): Promise<TokenDto> {
    const user = req.user as User;
    return this.authService.refreshToken(user);
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
    // 클라이언트 측에서 토큰을 제거하도록 함
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
  handleLogin( ){
    return {msg:'ok'}
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  handleRedirect(){
    return{msg: 'ok'};

  }
}
