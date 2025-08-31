import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

// Mock bcrypt module
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      nickname: 'testuser',
      bio: 'Test bio',
    };

    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: registerDto.email,
      nickname: registerDto.nickname,
      bio: registerDto.bio,
      role: UserRole.USER,
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access_token_mock')
        .mockReturnValueOnce('refresh_token_mock');

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(registerDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: registerDto.email },
          { nickname: registerDto.nickname },
        ],
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashed_password',
        nickname: registerDto.nickname,
        bio: registerDto.bio,
        role: UserRole.USER,
      });
      expect(result).toEqual({
        access_token: 'access_token_mock',
        refresh_token: 'refresh_token_mock',
        user: {
          user_id: mockUser.user_id,
          email: mockUser.email,
          nickname: mockUser.nickname,
          role: mockUser.role,
        },
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: [
          { email: registerDto.email },
          { nickname: registerDto.nickname },
        ],
      });
    });

    it('should throw ConflictException when nickname already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        nickname: registerDto.nickname,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: loginDto.email,
      password: 'hashed_password',
      nickname: 'testuser',
      role: UserRole.USER,
      is_active: true,
    };

    it('should successfully login a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access_token_mock')
        .mockReturnValueOnce('refresh_token_mock');

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email, is_active: true },
      });
      expect(result).toEqual({
        access_token: 'access_token_mock',
        refresh_token: 'refresh_token_mock',
        user: {
          user_id: mockUser.user_id,
          email: mockUser.email,
          nickname: mockUser.nickname,
          role: mockUser.role,
        },
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshToken', () => {
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      role: UserRole.USER,
    };

    it('should successfully refresh tokens', async () => {
      mockJwtService.sign
        .mockReturnValueOnce('new_access_token_mock')
        .mockReturnValueOnce('new_refresh_token_mock');

      const result = await service.refreshToken(mockUser as User);

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.user_id,
          email: mockUser.email,
        },
        { expiresIn: '7d' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: mockUser.user_id,
          email: mockUser.email,
        },
        { expiresIn: '30d' },
      );
      expect(result).toEqual({
        access_token: 'new_access_token_mock',
        refresh_token: 'new_refresh_token_mock',
        user: {
          user_id: mockUser.user_id,
          email: mockUser.email,
          nickname: mockUser.nickname,
          role: mockUser.role,
        },
      });
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      password: 'hashed_password',
      is_active: true,
    };

    it('should return user when credentials are valid', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        mockUser.email,
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Test bio',
      avatar_url: 'avatar.jpg',
      role: UserRole.USER,
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should return user profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser as User);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUser.user_id },
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
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(mockUser as User)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Old bio',
    };

    const updateData = {
      nickname: 'newnickname',
      bio: 'New bio',
    };

    it('should successfully update profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // 닉네임 중복 없음
      mockUserRepository.update.mockResolvedValue(undefined);
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.updateProfile(mockUser as User, updateData);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { nickname: updateData.nickname },
      });
      expect(mockUserRepository.update).toHaveBeenCalledWith(mockUser.user_id, {
        ...updateData,
        updated_at: expect.any(Date),
      });
      expect(result).toEqual({
        ...mockUser,
        ...updateData,
      });
    });

    it('should throw ConflictException when nickname already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        user_id: 'different_user_id',
        nickname: updateData.nickname,
      });

      await expect(
        service.updateProfile(mockUser as User, updateData),
      ).rejects.toThrow(ConflictException);
    });
  });
});
