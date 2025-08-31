import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

    const mockTokenDto: TokenDto = {
      access_token: 'access_token_mock',
      refresh_token: 'refresh_token_mock',
      user: {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: registerDto.email,
        nickname: registerDto.nickname,
        role: UserRole.USER,
      },
    };

    it('should successfully register a user', async () => {
      mockAuthService.register.mockResolvedValue(mockTokenDto);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockTokenDto);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidRegisterDto = {
        ...registerDto,
        email: 'invalid-email',
      };

      mockAuthService.register.mockRejectedValue(new BadRequestException('올바른 이메일 형식을 입력해주세요.'));

      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for weak password', async () => {
      const invalidRegisterDto = {
        ...registerDto,
        password: '123',
      };

      mockAuthService.register.mockRejectedValue(new BadRequestException('비밀번호는 최소 8자 이상이어야 합니다.'));

      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty nickname', async () => {
      const invalidRegisterDto = {
        ...registerDto,
        nickname: '',
      };

      mockAuthService.register.mockRejectedValue(new BadRequestException('닉네임을 입력해주세요.'));

      await expect(controller.register(invalidRegisterDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockTokenDto: TokenDto = {
      access_token: 'access_token_mock',
      refresh_token: 'refresh_token_mock',
      user: {
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        email: loginDto.email,
        nickname: 'testuser',
        role: UserRole.USER,
      },
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValue(mockTokenDto);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockTokenDto);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const invalidLoginDto = {
        ...loginDto,
        email: 'invalid-email',
      };

      mockAuthService.login.mockRejectedValue(new BadRequestException('올바른 이메일 형식을 입력해주세요.'));

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for empty password', async () => {
      const invalidLoginDto = {
        ...loginDto,
        password: '',
      };

      mockAuthService.login.mockRejectedValue(new BadRequestException('비밀번호를 입력해주세요.'));

      await expect(controller.login(invalidLoginDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refresh', () => {
    const mockUser: User = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      role: UserRole.USER,
    } as User;

    const mockTokenDto: TokenDto = {
      access_token: 'new_access_token_mock',
      refresh_token: 'new_refresh_token_mock',
      user: {
        user_id: mockUser.user_id,
        email: mockUser.email,
        nickname: mockUser.nickname,
        role: mockUser.role,
      },
    };

    const mockRequest = {
      user: mockUser,
    };

    it('should successfully refresh tokens', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockTokenDto);

      const result = await controller.refresh(mockRequest);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockTokenDto);
    });
  });

  describe('logout', () => {
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    it('should successfully logout a user', async () => {
      await controller.logout(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: '로그아웃되었습니다.',
      });
    });
  });

  describe('getProfile', () => {
    const mockUser: User = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Test bio',
      role: UserRole.USER,
    } as User;

    const mockRequest = {
      user: mockUser,
    };

    it('should return user profile', async () => {
      mockAuthService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    const mockUser: User = {
      user_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      nickname: 'testuser',
      bio: 'Old bio',
      role: UserRole.USER,
    } as User;

    const updateData = {
      nickname: 'newnickname',
      bio: 'New bio',
    };

    const mockRequest = {
      user: mockUser,
    };

    it('should successfully update profile', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockAuthService.updateProfile.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(mockRequest, updateData);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith(mockUser, updateData);
      expect(result).toEqual(updatedUser);
    });
  });
});
