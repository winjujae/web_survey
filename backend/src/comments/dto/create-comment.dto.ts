import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { Sanitize } from 'class-sanitizer';

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

export class CreateCommentDto {
  @IsUUID('4', { message: '게시글 ID는 유효한 UUID 형식이어야 합니다.' })
  post_id: string;

  @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '댓글 내용은 필수입니다.' })
  @MinLength(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(1000, { message: '댓글 내용은 최대 1000자까지 가능합니다.' })
  @IsNotForbidden({ message: '댓글 내용에 금지된 단어가 포함되어 있습니다.' })
  @Sanitize(String) // XSS 방지 및 타입 변환
  content: string;

  @IsOptional()
  @IsUUID('4', { message: '부모 댓글 ID는 유효한 UUID 형식이어야 합니다.' })
  parent_comment_id?: string;

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
}
