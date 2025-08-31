import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<TokenDto> {
    const { email, password, nickname, bio } = registerDto;

    // 기본 입력 유효성 검증
    if (!email || !email.includes('@')) {
      throw new BadRequestException('올바른 이메일 형식을 입력해주세요.');
    }

    if (!password || password.length < 8) {
      throw new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.');
    }

    if (!nickname || nickname.trim().length === 0) {
      throw new BadRequestException('닉네임을 입력해주세요.');
    }

    // 이메일 중복 확인
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { nickname }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
      if (existingUser.nickname === nickname) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    // 비밀번호 해시
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 사용자 생성
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname,
      bio,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    // JWT 토큰 생성
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async login(loginDto: LoginDto): Promise<TokenDto> {
    const { email, password } = loginDto;

    // 기본 입력 유효성 검증
    if (!email || !email.includes('@')) {
      throw new BadRequestException('올바른 이메일 형식을 입력해주세요.');
    }

    if (!password || password.trim().length === 0) {
      throw new BadRequestException('비밀번호를 입력해주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async refreshToken(user: User): Promise<TokenDto> {
    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, is_active: true },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  private async generateTokens(user: User): Promise<TokenDto> {
    const payload = {
      sub: user.user_id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        user_id: user.user_id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };
  }

  async getProfile(user: User): Promise<User> {
    const foundUser = await this.userRepository.findOne({
      where: { user_id: user.user_id },
      select: ['user_id', 'email', 'nickname', 'bio', 'avatar_url', 'role', 'created_at', 'updated_at'],
    });

    if (!foundUser) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return foundUser;
  }

  async updateProfile(user: User, updateData: Partial<User>): Promise<User> {
    // 닉네임 중복 확인
    if (updateData.nickname && updateData.nickname !== user.nickname) {
      const existingUser = await this.userRepository.findOne({
        where: { nickname: updateData.nickname },
      });

      if (existingUser && existingUser.user_id !== user.user_id) {
        throw new ConflictException('이미 사용 중인 닉네임입니다.');
      }
    }

    await this.userRepository.update(user.user_id, {
      ...updateData,
      updated_at: new Date(),
    });

    return this.getProfile(user);
  }
}
