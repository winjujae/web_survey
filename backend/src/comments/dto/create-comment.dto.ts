import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsUUID('4', { message: '게시글 ID는 유효한 UUID 형식이어야 합니다.' })
  post_id: string;

  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '댓글 내용은 필수입니다.' })
  @MinLength(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '댓글 내용은 최대 1000자까지 가능합니다.' })
  content: string;

  @IsOptional()
  @IsUUID('4', { message: '부모 댓글 ID는 유효한 UUID 형식이어야 합니다.' })
  parent_comment_id?: string;

  @IsOptional()
  @IsBoolean({ message: '익명 여부는 boolean 값이어야 합니다.' })
  is_anonymous?: boolean;

  @IsOptional()
  @IsString({ message: '익명 닉네임은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '익명 닉네임은 최대 50자까지 가능합니다.' })
  anonymous_nickname?: string;
}
