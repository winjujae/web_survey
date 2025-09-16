import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class PostViewDto {
  @ApiProperty({ description: '게시글 고유 ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose({ name: 'post_id' })
  id!: string;

  @ApiPropertyOptional({ description: '카테고리 ID(UUID v4)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose({ name: 'category_id' })
  boardId?: string;

  @ApiProperty({ description: '제목', example: '미녹시딜 3개월차 변화 공유합니다' })
  @Expose()
  title!: string;

  @ApiProperty({ description: '본문', example: '미녹시딜 사용 후 3개월간의 변화를 공유합니다.' })
  @Expose({ name: 'content' })
  body!: string;

  @ApiProperty({ description: '작성자 표시명', example: '탈모탈출러' })
  @Expose()
  @Transform(({ obj }) => (obj.is_anonymous ? (obj.anonymous_nickname ?? '익명') : (obj.user?.nickname ?? '작성자')))
  author!: string;

  @ApiProperty({ description: '생성일시(ISO)', example: '2024-01-01T00:00:00.000Z' })
  @Expose({ name: 'created_at' })
  @Transform(({ value }) => (value instanceof Date ? value.toISOString() : String(value)))
  createdAt!: string;

  @ApiPropertyOptional({ description: '태그 목록', type: [String], example: ['#탈모케어', '#샴푸'] })
  @Expose()
  @Transform(({ obj }) => (Array.isArray(obj.tags) ? obj.tags.map((t: any) => t?.name ?? t) : []))
  tags?: string[];

  @ApiProperty({ description: '좋아요 수', example: 0 })
  @Expose({ name: 'likes_count' })
  likes!: number;

  @ApiProperty({ description: '조회수', example: 0 })
  @Expose({ name: 'view_count' })
  views!: number;

  @ApiPropertyOptional({ description: '싫어요 수', example: 0 })
  @Expose()
  @Transform(({ obj }) => Number(obj.dislikes ?? 0))
  dislikes?: number;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  currentPage!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;

  @ApiProperty({ example: 100 })
  totalItems!: number;

  @ApiProperty({ example: 10 })
  itemsPerPage!: number;
}

export class PostSingleResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: PostViewDto })
  data!: PostViewDto;

  @ApiPropertyOptional({ example: '게시글이 성공적으로 생성되었습니다.' })
  message?: string;
}

export class PostListResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ type: [PostViewDto] })
  data!: PostViewDto[];

  @ApiProperty({ type: PaginationDto })
  pagination!: PaginationDto;
}


