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
  Matches,
  ValidateBy,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Sanitize } from 'class-sanitizer';
import { Transform } from 'class-transformer';
import { PostType } from '../entities/post.entity';

// 금지어 목록
const FORBIDDEN_WORDS = [
  '시발', '개새끼', '병신', '지랄', 'fuck', 'shit', 'damn',
  '새끼', '좆', '보지', '자지', '섹스', '포르노', '야동'
];

// 금지어 검증 함수
function ContainsForbiddenWords(value: string): boolean {
  if (!value) return true;

  const lowerValue = value.toLowerCase();
  return !FORBIDDEN_WORDS.some(word =>
    lowerValue.includes(word.toLowerCase())
  );
}

// 커스텀 금지어 검증 데코레이터
function IsNotForbidden(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotForbidden',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return ContainsForbiddenWords(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}에 금지된 단어가 포함되어 있습니다.`;
        },
      },
    });
  };
}

export class CreatePostDto {
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '제목은 필수입니다.' })
  @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다.' })
  @MaxLength(200, { message: '제목은 최대 200자까지 가능합니다.' })
  @Matches(/^[^<>&"']*$/, { message: '제목에 특수문자 <>&"\'가 포함될 수 없습니다.' })
  @IsNotForbidden({ message: '제목에 금지된 단어가 포함되어 있습니다.' })
  @Sanitize(String) // XSS 방지 및 타입 변환
  title: string;

  @IsString({ message: '내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '내용은 필수입니다.' })
  @MinLength(1, { message: '내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(10000, { message: '내용은 최대 10000자까지 가능합니다.' })
  @IsNotForbidden({ message: '내용에 금지된 단어가 포함되어 있습니다.' })
  @Sanitize(String) // XSS 방지 및 타입 변환
  content: string;

  @IsOptional()
  @IsArray({ message: '이미지 URL은 배열이어야 합니다.' })
  @ArrayMaxSize(10, { message: '이미지는 최대 10개까지 업로드 가능합니다.' })
  @IsString({ each: true, message: '각 이미지 URL은 문자열이어야 합니다.' })
  @Matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, {
    each: true,
    message: '유효한 URL 형식이어야 합니다.'
  })
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
  @MinLength(2, { message: '익명 닉네임은 최소 2자 이상이어야 합니다.' })
  @MaxLength(20, { message: '익명 닉네임은 최대 20자까지 가능합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣_]+$/, { message: '익명 닉네임은 한글, 영문, 숫자, 언더스코어만 사용할 수 있습니다.' })
  @IsNotForbidden({ message: '익명 닉네임에 금지된 단어가 포함되어 있습니다.' })
  @Sanitize(String) // XSS 방지 및 타입 변환
  anonymous_nickname?: string;

  @IsOptional()
  @IsArray({ message: '태그는 배열이어야 합니다.' })
  @ArrayMaxSize(10, { message: '태그는 최대 10개까지 추가 가능합니다.' })
  @IsString({ each: true, message: '각 태그는 문자열이어야 합니다.' })
  @MinLength(1, { each: true, message: '태그는 최소 1자 이상이어야 합니다.' })
  @MaxLength(30, { each: true, message: '태그는 최대 30자까지 가능합니다.' })
  @Matches(/^[a-zA-Z0-9가-힣#]+$/, {
    each: true,
    message: '태그는 한글, 영문, 숫자, #만 사용할 수 있습니다.'
  })
  @Transform(({ value }) => {
    // # 접두사 자동 추가
    if (Array.isArray(value)) {
      return value.map(tag =>
        tag.startsWith('#') ? tag : `#${tag}`
      );
    }
    return value;
  })
  tags?: string[];
}
