import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  // post_id와 parent_comment_id는 업데이트 시 변경할 수 없음
  post_id?: never;
  parent_comment_id?: never;
}
