/**
 * @file route.ts
 * @description 댓글 API 라우트
 *
 * POST /api/comments: 댓글 작성
 * - Clerk 인증 검증
 * - users 테이블에서 user_id 조회
 * - comments 테이블에 데이터 저장
 *
 * DELETE /api/comments: 댓글 삭제
 * - Clerk 인증 검증
 * - 댓글 작성자 확인 (본인만 삭제 가능)
 * - comments 테이블에서 삭제
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';
import type { CommentWithUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/comments
 * 댓글 작성
 *
 * Body:
 * - postId: 게시물 ID (UUID)
 * - content: 댓글 내용 (필수)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(401) },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: getErrorMessage(400, '게시물 ID와 댓글 내용이 필요합니다.') },
        { status: 400 }
      );
    }

    // 댓글 내용 검증 (빈 문자열 또는 공백만 있는 경우 제외)
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: getErrorMessage(400, '댓글 내용을 입력해주세요.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      logError(userError, 'POST /api/comments - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 게시물 존재 확인
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      const errorMessage = postError ? getSupabaseErrorMessage(postError) : '게시물을 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 댓글 생성
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: trimmedContent,
      })
      .select()
      .single();

    if (commentError) {
      logError(commentError, 'POST /api/comments - Create comment');
      const errorMessage = getSupabaseErrorMessage(commentError);
      return NextResponse.json(
        { error: errorMessage || '댓글 작성에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('id, clerk_id, name, created_at')
      .eq('id', user.id)
      .single();

    // CommentWithUser 타입으로 변환
    const commentWithUser: CommentWithUser = {
      ...comment,
      user: userData || {
        id: user.id,
        clerk_id: clerkUserId,
        name: '',
        created_at: new Date().toISOString(),
      },
    };

    return NextResponse.json(
      { success: true, comment: commentWithUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments
 * 댓글 삭제
 *
 * Body:
 * - commentId: 댓글 ID (UUID)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(401) },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '댓글 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      logError(userError, 'DELETE /api/comments - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 댓글 조회 및 작성자 확인
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      const errorMessage = commentError ? getSupabaseErrorMessage(commentError) : '댓글을 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 본인이 작성한 댓글인지 확인
    if (comment.user_id !== user.id) {
      return NextResponse.json(
        { error: getErrorMessage(403, '본인이 작성한 댓글만 삭제할 수 있습니다.') },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (deleteError) {
      logError(deleteError, 'DELETE /api/comments - Delete comment');
      const errorMessage = getSupabaseErrorMessage(deleteError);
      return NextResponse.json(
        { error: errorMessage || '댓글 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError(error, 'DELETE /api/comments');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

