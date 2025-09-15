import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({ description: '수정할 게시글 제목' })
  declare title?: string;

  @ApiPropertyOptional({ description: '수정할 게시글 본문' })
  declare content?: string;

  @ApiPropertyOptional({ description: '수정할 카테고리 ID(UUID v4)' })
  declare category_id?: string;

  @ApiPropertyOptional({ description: '수정할 태그 목록', type: [String] })
  declare tags?: string[];
}
