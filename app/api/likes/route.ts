/**
 * @file route.ts
 * @description 좋아요 API 라우트
 *
 * POST /api/likes: 좋아요 추가
 * DELETE /api/likes: 좋아요 제거
 * - 인증 검증 (Clerk)
 * - 중복 좋아요 방지
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @clerk/nextjs/server: Clerk 인증
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * POST /api/likes
 * 좋아요 추가
 *
 * Body:
 * - postId: 게시물 ID (UUID)
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: '게시물 ID가 필요합니다.' },
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
      logError(userError, 'POST /api/likes - Find user');
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

    // 이미 좋아요가 있는지 확인
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: getErrorMessage(400, '이미 좋아요를 눌렀습니다.') },
        { status: 400 }
      );
    }

    // 좋아요 추가
    const { data: like, error: likeError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })
      .select()
      .single();

    if (likeError) {
      logError(likeError, 'POST /api/likes - Create like');
      const errorMessage = getSupabaseErrorMessage(likeError);
      return NextResponse.json(
        { error: errorMessage || '좋아요를 추가하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, like }, { status: 201 });
  } catch (error) {
    logError(error, 'POST /api/likes');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/likes
 * 좋아요 제거
 *
 * Body:
 * - postId: 게시물 ID (UUID)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: '게시물 ID가 필요합니다.' },
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
      logError(userError, 'DELETE /api/likes - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 좋아요 제거
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (deleteError) {
      logError(deleteError, 'DELETE /api/likes - Delete like');
      const errorMessage = getSupabaseErrorMessage(deleteError);
      return NextResponse.json(
        { error: errorMessage || '좋아요를 제거하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError(error, 'DELETE /api/likes');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

