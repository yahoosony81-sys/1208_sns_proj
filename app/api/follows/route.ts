/**
 * @file route.ts
 * @description 팔로우 API 라우트
 *
 * POST /api/follows: 팔로우 추가
 * DELETE /api/follows: 팔로우 제거
 * - 인증 검증 (Clerk)
 * - 자기 자신 팔로우 방지
 * - 중복 팔로우 방지
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
 * POST /api/follows
 * 팔로우 추가
 *
 * Body:
 * - followingId: 팔로우할 사용자 ID (UUID)
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '팔로우할 사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 현재 사용자 찾기
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      logError(userError, 'POST /api/follows - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 자기 자신 팔로우 방지
    if (currentUser.id === followingId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '자기 자신을 팔로우할 수 없습니다.') },
        { status: 400 }
      );
    }

    // 팔로우할 사용자 존재 확인
    const { data: followingUser, error: followingUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', followingId)
      .single();

    if (followingUserError || !followingUser) {
      const errorMessage = followingUserError ? getSupabaseErrorMessage(followingUserError) : '팔로우할 사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 이미 팔로우 중인지 확인
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', followingId)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: getErrorMessage(409, '이미 팔로우 중입니다.') },
        { status: 409 }
      );
    }

    // 팔로우 추가
    const { data: follow, error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUser.id,
        following_id: followingId,
      })
      .select()
      .single();

    if (followError) {
      logError(followError, 'POST /api/follows - Create follow');
      const errorMessage = getSupabaseErrorMessage(followError);
      return NextResponse.json(
        { error: errorMessage || '팔로우를 추가하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, follow }, { status: 201 });
  } catch (error) {
    logError(error, 'POST /api/follows');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follows
 * 팔로우 제거
 *
 * Body:
 * - followingId: 언팔로우할 사용자 ID (UUID)
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
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '언팔로우할 사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 현재 사용자 찾기
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      logError(userError, 'DELETE /api/follows - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 팔로우 제거
    const { error: deleteError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', followingId);

    if (deleteError) {
      logError(deleteError, 'DELETE /api/follows - Delete follow');
      const errorMessage = getSupabaseErrorMessage(deleteError);
      return NextResponse.json(
        { error: errorMessage || '팔로우를 제거하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError(error, 'DELETE /api/follows');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

