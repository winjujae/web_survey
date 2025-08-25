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
import { PostsService, PostFilters, PaginationOptions } from './posts.service';
import type { PostFilters as IPostFilters } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { User } from '../users/entities/user.entity';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    const user = req.user as User;
    const post = await this.postsService.create(createPostDto, user);
    return {
      success: true,
      message: '게시글이 성공적으로 생성되었습니다.',
      data: post,
    };
  }

  @Get()
  async findAll(
    @Query() filters: IPostFilters,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: (sortBy as PaginationOptions['sortBy']) || 'created_at',
      sortOrder: (sortOrder as PaginationOptions['sortOrder']) || 'DESC',
    };

    const result = await this.postsService.findAll(filters, pagination);
    return {
      success: true,
      data: result.posts,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const user = req.user as User;
    const post = await this.postsService.findOne(id, user);
    return {
      success: true,
      data: post,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    const user = req.user as User;
    const post = await this.postsService.update(id, updatePostDto, user);
    return {
      success: true,
      message: '게시글이 성공적으로 수정되었습니다.',
      data: post,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const user = req.user as User;
    await this.postsService.remove(id, user);
    return {
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.',
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const user = req.user as User;
    const result = await this.postsService.toggleLike(id, user);
    return {
      success: true,
      message: result.liked ? '게시글을 좋아요했습니다.' : '게시글 좋아요를 취소했습니다.',
      data: result,
    };
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const user = req.user as User;
    const result = await this.postsService.toggleBookmark(id, user);
    return {
      success: true,
      message: result.bookmarked ? '게시글을 북마크했습니다.' : '게시글 북마크를 취소했습니다.',
      data: result,
    };
  }

  @Get('user/:userId')
  async getUserPosts(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };

    const result = await this.postsService.getUserPosts(userId, pagination);
    return {
      success: true,
      data: result.posts,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    };
  }

  @Get('search/:keyword')
  async searchPosts(
    @Param('keyword') keyword: string,
    @Query() filters: Omit<IPostFilters, 'search'>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    };

    const result = await this.postsService.findAll(
      { ...filters, search: keyword },
      pagination,
    );

    return {
      success: true,
      data: result.posts,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
      search: {
        keyword,
        totalResults: result.total,
      },
    };
  }
}
