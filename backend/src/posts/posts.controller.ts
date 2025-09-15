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
  Req,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { PostsService, PostFilters, PaginationOptions } from './posts.service';
import type { PostFilters as IPostFilters } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { User } from '../users/entities/user.entity';
// Express Request 타입 확장
declare module 'express' {
  interface Request {
    ip?: string;
  }
}

import type { Request } from 'express';

@ApiTags('posts')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '게시글 작성',
    description: '새로운 게시글을 작성합니다.',
  })
  @ApiResponse({ status: 201, description: '게시글 작성 성공' })
  @ApiBody({ type: CreatePostDto, description: '게시글 생성 입력' })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  @ApiResponse({ status: 404, description: '카테고리를 찾을 수 없음' })
  async create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
    const user = req.user as User;
    const post = await this.postsService.create(createPostDto, user);
    return {
      success: true,
      message: '게시글이 성공적으로 생성되었습니다.',
      data: post,
    };
  }

  @Get()
  @ApiOperation({
    summary: '게시글 목록 조회',
    description: '게시글 목록을 페이징과 필터링하여 조회합니다.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '페이지당 항목 수',
    example: '10',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: '정렬 기준',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: '정렬 순서',
    example: 'DESC',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    description: '카테고리 ID',
  })
  @ApiQuery({ name: 'type', required: false, description: '게시글 타입' })
  @ApiQuery({ name: 'status', required: false, description: '게시글 상태' })
  @ApiQuery({ name: 'search', required: false, description: '검색어' })
  @ApiQuery({ name: 'tags', required: false, description: '태그 필터링 (쉼표로 구분)', example: '#탈모케어,#샴푸' })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
  async findAll(
    @Query() filters: IPostFilters,
    @Req() request: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('tags') tags?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: (sortBy as PaginationOptions['sortBy']) || 'created_at',
      sortOrder: (sortOrder as PaginationOptions['sortOrder']) || 'DESC',
    };

    // 태그 필터링 처리
    const processedFilters = { ...filters };
    if (tags) {
      processedFilters.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    const result = await this.postsService.findAll(processedFilters, pagination, request.ip);
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
  @ApiParam({
    name: 'id',
    description: '게시글 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: '특정 게시글의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '게시글 조회 성공' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없음' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
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
  @ApiBody({ type: UpdatePostDto, description: '게시글 수정 입력' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
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
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const user = req.user as User;
    await this.postsService.remove(id, user);
    return {
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.',
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    const result = await this.postsService.toggleLike(id, user);
    return {
      success: true,
      message: result.liked
        ? '게시글을 좋아요했습니다.'
        : '게시글 좋아요를 취소했습니다.',
      data: result,
    };
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  async toggleBookmark(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    const user = req.user as User;
    const result = await this.postsService.toggleBookmark(id, user);
    return {
      success: true,
      message: result.bookmarked
        ? '게시글을 북마크했습니다.'
        : '게시글 북마크를 취소했습니다.',
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
    @Req() request: Request,
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
      request.ip,
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
