// src/lib/hooks/useActionState.ts
"use client";
import { useActionState } from "react";

/**
 * React 19의 useActionState 훅을 활용한 폼 액션 관리
 * 게시글 작성, 댓글 작성 등에 사용
 */

// 게시글 작성 액션 타입
type CreatePostAction = {
  type: 'CREATE_POST';
  payload: {
    title: string;
    content: string;
    boardId: string;
    tags?: string[];
  };
};

// 댓글 작성 액션 타입
type CreateCommentAction = {
  type: 'CREATE_COMMENT';
  payload: {
    postId: string;
    content: string;
  };
};

type Action = CreatePostAction | CreateCommentAction;

/**
 * 게시글 작성 액션 상태 관리
 */
export function useCreatePostAction() {
  return useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const boardId = formData.get('boardId') as string;
        
        // API 호출 로직
        // const result = await createPost({ title, content, boardId });
        
        return { success: true, message: '게시글이 작성되었습니다.' };
      } catch (error) {
        return { success: false, message: '게시글 작성에 실패했습니다.' };
      }
    },
    { success: false, message: '' }
  );
}

/**
 * 댓글 작성 액션 상태 관리
 */
export function useCreateCommentAction() {
  return useActionState(
    async (prevState: any, formData: FormData) => {
      try {
        const postId = formData.get('postId') as string;
        const content = formData.get('content') as string;
        
        // API 호출 로직
        // const result = await createComment({ postId, content });
        
        return { success: true, message: '댓글이 작성되었습니다.' };
      } catch (error) {
        return { success: false, message: '댓글 작성에 실패했습니다.' };
      }
    },
    { success: false, message: '' }
  );
}
