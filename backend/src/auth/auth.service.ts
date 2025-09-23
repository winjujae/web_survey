import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
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
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
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

  async generateTokens(user: User): Promise<TokenDto> {
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
      select: [
        'user_id',
        'email',
        'nickname',
        'bio',
        'avatar_url',
        'role',
        'created_at',
        'updated_at',
      ],
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

  async findUser(userId:string){
    const user = await this.userRepository.findOneBy({user_id: userId})
    return user
  }

  async findOrCreateGoogleUser(googleUserInfo: any): Promise<User> {
    const { googleId, email, name, picture, emailVerified } = googleUserInfo;

    try {
      // 1. Google ID로 기존 사용자 찾기
      let user = await this.userRepository.findOne({
        where: { google_id: googleId }
      });

      if (user) {
        // 기존 구글 사용자 정보 업데이트
        if (user.avatar_url !== picture && picture) {
          user.avatar_url = picture;
          await this.userRepository.save(user);
        }
        return user;
      }

      // 2. 이메일로 기존 사용자 찾기 (계정 연결)
      user = await this.userRepository.findOne({
        where: { email }
      });

      if (user) {
        // 기존 이메일 계정에 Google 연결
        user.google_id = googleId;
        user.provider = 'google';
        user.email_verified = emailVerified || true;
        if (picture) {
          user.avatar_url = picture;
        }
        return await this.userRepository.save(user);
      }

      // 3. 새 사용자 생성
      // 실제 이름을 기반으로 닉네임 생성 (현재 요구사항)
      const uniqueNickname = await this.generateUniqueNickname(name || email.split('@')[0]);
      
      const newUser = this.userRepository.create({
        email,
        name: name, // 실제 이름 저장
        nickname: uniqueNickname, // 실제 이름 기반으로 생성된 닉네임
        google_id: googleId,
        provider: 'google',
        email_verified: emailVerified || true,
        avatar_url: picture,
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12), // 랜덤 비밀번호
        role: UserRole.USER,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Google 사용자 생성/찾기 실패:', error);
      throw new BadRequestException('구글 계정 처리 중 오류가 발생했습니다.');
    }
  }

  async findOrCreateKakaoUser(kakaoUserInfo: any): Promise<User> {
    const { kakaoId, email, name, picture, emailVerified } = kakaoUserInfo;

    try {
      // 1. Kakao ID로 기존 사용자 찾기
      let user = await this.userRepository.findOne({
        where: { kakao_id: kakaoId }
      });

      if (user) {
        if (user.avatar_url !== picture && picture) {
          user.avatar_url = picture;
          await this.userRepository.save(user);
        }
        return user;
      }

      // 2. 이메일이 있는 경우 이메일로 기존 사용자 찾기 (계정 연결)
      if (email) {
        user = await this.userRepository.findOne({ where: { email } });
        if (user) {
          user.kakao_id = kakaoId;
          user.provider = 'kakao';
          user.email_verified = emailVerified || true;
          if (picture) user.avatar_url = picture;
          return await this.userRepository.save(user);
        }
      }

      // 3. 새 사용자 생성 (이메일이 없을 수도 있음)
      const baseNickname = name || (email ? email.split('@')[0] : `kakao${kakaoId.slice(-6)}`);
      const uniqueNickname = await this.generateUniqueNickname(baseNickname);

      const newUser = this.userRepository.create({
        email: email || `kakao_${kakaoId}@placeholder.local`,
        name: name,
        nickname: uniqueNickname,
        kakao_id: kakaoId,
        provider: 'kakao',
        email_verified: Boolean(emailVerified),
        avatar_url: picture,
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12),
        role: UserRole.USER,
      });

      return await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Kakao 사용자 생성/찾기 실패:', error);
      throw new BadRequestException('카카오 계정 처리 중 오류가 발생했습니다.');
    }
  }

  private async generateUniqueNickname(baseName: string): Promise<string> {
    // 특수문자 제거 및 기본 정리
    let cleanName = baseName
      .replace(/[^a-zA-Z0-9가-힣_]/g, '')
      .substring(0, 15);
    
    if (!cleanName) {
      cleanName = '사용자';
    }

    // 중복 확인 및 고유 닉네임 생성
    let nickname = cleanName;
    let counter = 1;
    
    while (true) {
      const existingUser = await this.userRepository.findOne({
        where: { nickname }
      });
      
      if (!existingUser) {
        return nickname;
      }
      
      nickname = `${cleanName}${counter}`;
      counter++;
      
      // 무한 루프 방지
      if (counter > 9999) {
        nickname = `${cleanName}${Date.now()}`;
        break;
      }
    }
    
    return nickname;
  }
}
