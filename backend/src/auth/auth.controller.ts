import { Controller, Post, Body, Get, Put, UseGuards, Request, Response, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { User } from '../users/entities/user.entity';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<TokenDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<TokenDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: any): Promise<TokenDto> {
    const user = req.user as User;
    return this.authService.refreshToken(user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Response() res: any): Promise<void> {
    // 클라이언트 측에서 토큰을 제거하도록 함
    res.status(HttpStatus.OK).json({ message: '로그아웃되었습니다.' });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any): Promise<User> {
    const user = req.user as User;
    return this.authService.getProfile(user);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: any,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    const user = req.user as User;
    return this.authService.updateProfile(user, updateData);
  }
}
