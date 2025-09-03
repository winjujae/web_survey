import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { TagsService, TagRanking } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

// Express Request 타입 확장
declare module 'express' {
  interface Request {
    ip?: string;
  }
}

import type { Request } from 'express';

class CreateTagDto {
  name: string;
  description?: string;
}

class AddTagsToPostDto {
  tag_names: string[];
}

@ApiTags('tags')
@Controller('api/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '태그 생성',
    description: '새로운 태그를 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '태그 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 입력 데이터' })
  @ApiResponse({ status: 409, description: '이미 존재하는 태그' })
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto.name, createTagDto.description);
    return {
      success: true,
      message: '태그가 성공적으로 생성되었습니다.',
      data: tag,
    };
  }

  @Get()
  @ApiOperation({
    summary: '태그 목록 조회',
    description: '모든 태그 목록을 조회합니다.',
  })
  @ApiQuery({ name: 'limit', required: false, description: '조회할 태그 수' })
  @ApiQuery({ name: 'offset', required: false, description: '건너뛸 태그 수' })
  @ApiResponse({ status: 200, description: '태그 목록 조회 성공' })
  async findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const tags = await this.tagsService.findAll(
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
    return {
      success: true,
      data: tags,
    };
  }

  @Get('search')
  @ApiOperation({
    summary: '태그 검색',
    description: '태그명을 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, description: '검색어' })
  @ApiQuery({ name: 'limit', required: false, description: '결과 수 제한' })
  @ApiResponse({ status: 200, description: '태그 검색 성공' })
  async searchTags(
    @Query('q') query: string,
    @Req() request: Request,
    @Query('limit') limit?: string,
  ) {
    const user = request.user as any;
    const tags = await this.tagsService.searchTags(
      query,
      limit ? parseInt(limit, 10) : 10,
      user?.user_id,
      request.ip,
    );
    return {
      success: true,
      data: tags,
    };
  }

  @Get('ranking')
  @ApiOperation({
    summary: '태그 랭킹 조회',
    description: '사용 빈도순으로 태그 랭킹을 조회합니다.',
  })
  @ApiQuery({ name: 'limit', required: false, description: '랭킹 수 제한' })
  @ApiResponse({ status: 200, description: '태그 랭킹 조회 성공' })
  async getTagRanking(@Query('limit') limit?: string): Promise<{ success: boolean; data: TagRanking[] }> {
    const ranking = await this.tagsService.getTagRanking(
      limit ? parseInt(limit, 10) : 10,
    );
    return {
      success: true,
      data: ranking,
    };
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: '태그 ID' })
  @ApiOperation({
    summary: '태그 상세 조회',
    description: '특정 태그의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '태그 조회 성공' })
  @ApiResponse({ status: 404, description: '태그를 찾을 수 없음' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tag = await this.tagsService.findOne(id);
    return {
      success: true,
      data: tag,
    };
  }

  @Get(':id/posts')
  @ApiParam({ name: 'id', description: '태그 ID' })
  @ApiOperation({
    summary: '태그별 게시물 조회',
    description: '특정 태그가 달린 게시물들을 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수' })
  @ApiResponse({ status: 200, description: '게시물 조회 성공' })
  async getPostsByTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.tagsService.getPostsByTag(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
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
    };
  }

  @Post('posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'postId', description: '게시물 ID' })
  @ApiOperation({
    summary: '게시물에 태그 추가',
    description: '게시물에 태그들을 추가합니다.',
  })
  @ApiResponse({ status: 200, description: '태그 추가 성공' })
  @ApiResponse({ status: 404, description: '게시물 또는 태그를 찾을 수 없음' })
  async addTagsToPost(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Body() addTagsDto: AddTagsToPostDto,
  ) {
    await this.tagsService.addTagsToPost(postId, addTagsDto.tag_names);
    return {
      success: true,
      message: '태그가 성공적으로 추가되었습니다.',
    };
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: '태그 통계 조회',
    description: '태그 관련 전체 통계를 조회합니다.',
  })
  @ApiResponse({ status: 200, description: '통계 조회 성공' })
  async getTagStats() {
    const stats = await this.tagsService.getTagStats();
    return {
      success: true,
      data: stats,
    };
  }
}
