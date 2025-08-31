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
import {
  CommentsService,
  CommentFilters,
  PaginationOptions,
} from './comments.service';
import type { CommentFilters as ICommentFilters } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { User } from '../users/entities/user.entity';

@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    const user = req.user as User;
    const comment = await this.commentsService.create(createCommentDto, user);
    return {
      success: true,
      message: '댓글이 성공적으로 생성되었습니다.',
      data: comment,
    };
  }

  @Get()
  async findAll(
    @Query() filters: ICommentFilters,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: (sortBy as PaginationOptions['sortBy']) || 'created_at',
      sortOrder: (sortOrder as PaginationOptions['sortOrder']) || 'ASC',
    };

    const result = await this.commentsService.findAll(filters, pagination);
    return {
      success: true,
      data: result.comments,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const comment = await this.commentsService.findOne(id);
    return {
      success: true,
      data: comment,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req: any,
  ) {
    const user = req.user as User;
    const comment = await this.commentsService.update(
      id,
      updateCommentDto,
      user,
    );
    return {
      success: true,
      message: '댓글이 성공적으로 수정되었습니다.',
      data: comment,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const user = req.user as User;
    await this.commentsService.remove(id, user);
    return {
      success: true,
      message: '댓글이 성공적으로 삭제되었습니다.',
    };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  async toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ) {
    const user = req.user as User;
    const result = await this.commentsService.toggleLike(id, user);
    return {
      success: true,
      message: result.liked
        ? '댓글을 좋아요했습니다.'
        : '댓글 좋아요를 취소했습니다.',
      data: result,
    };
  }

  @Get('post/:postId')
  async getPostComments(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy: 'created_at',
      sortOrder: 'ASC',
    };

    const result = await this.commentsService.getPostComments(
      postId,
      pagination,
    );
    return {
      success: true,
      data: result.comments,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    };
  }

  @Get('user/:userId')
  async getUserComments(
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

    const result = await this.commentsService.getUserComments(
      userId,
      pagination,
    );
    return {
      success: true,
      data: result.comments,
      pagination: {
        currentPage: result.page,
        totalPages: result.totalPages,
        totalItems: result.total,
        itemsPerPage: result.limit,
      },
    };
  }

  @Get(':id/replies')
  async getCommentReplies(@Param('id', ParseUUIDPipe) id: string) {
    const replies = await this.commentsService.getCommentReplies(id);
    return {
      success: true,
      data: replies,
    };
  }
}
