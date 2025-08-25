import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // 이메일과 비밀번호는 업데이트 시 변경할 수 없음
  email?: never;
  password?: never;
}
