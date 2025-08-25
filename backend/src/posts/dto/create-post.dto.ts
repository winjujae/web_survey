import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { PostType } from '../entities/post.entity';

export class CreatePostDto {
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 가능합니다.' })
  title: string;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용은 필수입니다.' })
  @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다.' })
  content: string;

  @IsOptional()
  @IsArray({ message: '이미지 URL은 배열이어야 합니다.' })
  @ArrayMaxSize(10, { message: '이미지는 최대 10개까지 업로드 가능합니다.' })
  @IsString({ each: true, message: '각 이미지 URL은 문자열이어야 합니다.' })
  image_urls?: string[];

  @IsOptional()
  @IsUUID('4', { message: '카테고리 ID는 유효한 UUID 형식이어야 합니다.' })
  category_id?: string;

  @IsOptional()
  @IsEnum(PostType, { message: '게시글 유형이 올바르지 않습니다.' })
  type?: PostType;

  @IsOptional()
  @IsBoolean({ message: '익명 여부는 boolean 값이어야 합니다.' })
  is_anonymous?: boolean;

  @IsOptional()
  @IsString({ message: '익명 닉네임은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '익명 닉네임은 최대 50자까지 가능합니다.' })
  anonymous_nickname?: string;
}
