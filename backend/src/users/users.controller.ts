import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService, UserProfile, UserStats } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: '사용자가 성공적으로 생성되었습니다.',
      data: user,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      data: users,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const currentUser = req.user as User;

    // 본인 정보만 수정 가능하거나 관리자인 경우
    if (currentUser.user_id !== id && currentUser.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: '권한이 없습니다.',
      };
    }

    const user = await this.usersService.update(id, updateUserDto, currentUser);
    return {
      success: true,
      message: '사용자 정보가 성공적으로 수정되었습니다.',
      data: user,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const currentUser = req.user as User;
    await this.usersService.remove(id, currentUser);
    return {
      success: true,
      message: '사용자가 성공적으로 삭제되었습니다.',
    };
  }

  // 프로필 관련 API
  @Get(':id/profile')
  async getProfile(@Param('id', ParseUUIDPipe) id: string): Promise<{
    success: boolean;
    data: UserProfile;
  }> {
    const profile = await this.usersService.getProfile(id);
    return {
      success: true,
      data: profile,
    };
  }

  @Get(':id/stats')
  async getUserStats(@Param('id', ParseUUIDPipe) id: string): Promise<{
    success: boolean;
    data: UserStats;
  }> {
    const stats = await this.usersService.getUserStats(id);
    return {
      success: true,
      data: stats,
    };
  }

  // 마이페이지 관련 API
  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Request() req: any): Promise<{
    success: boolean;
    data: UserProfile;
  }> {
    const user = req.user as User;
    const profile = await this.usersService.getProfile(user.user_id);
    return {
      success: true,
      data: profile,
    };
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getMyStats(@Request() req: any): Promise<{
    success: boolean;
    data: UserStats;
  }> {
    const user = req.user as User;
    const stats = await this.usersService.getUserStats(user.user_id);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('me/posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as User;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.getUserPosts(
      user.user_id,
      pageNum,
      limitNum,
    );
    return {
      success: true,
      data: result.posts,
      pagination: result.pagination,
    };
  }

  @Get('me/comments')
  @UseGuards(JwtAuthGuard)
  async getMyComments(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as User;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.getUserComments(
      user.user_id,
      pageNum,
      limitNum,
    );
    return {
      success: true,
      data: result.comments,
      pagination: result.pagination,
    };
  }

  @Get('me/bookmarks')
  @UseGuards(JwtAuthGuard)
  async getMyBookmarks(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const user = req.user as User;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.getUserBookmarks(
      user.user_id,
      pageNum,
      limitNum,
    );
    return {
      success: true,
      data: result.bookmarks,
      pagination: result.pagination,
    };
  }

  // 사용자별 게시글 조회 (공개 API)
  @Get(':id/posts')
  async getUserPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.getUserPosts(id, pageNum, limitNum);
    return {
      success: true,
      data: result.posts,
      pagination: result.pagination,
    };
  }

  // 사용자별 댓글 조회 (공개 API)
  @Get(':id/comments')
  async getUserComments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const result = await this.usersService.getUserComments(
      id,
      pageNum,
      limitNum,
    );
    return {
      success: true,
      data: result.comments,
      pagination: result.pagination,
    };
  }
}
