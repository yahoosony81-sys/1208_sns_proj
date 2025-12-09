/**
 * @file route.ts
 * @description 사용자 정보 조회 API 라우트
 *
 * GET /api/users/[userId]: 사용자 정보 조회
 * - user_stats 뷰 활용하여 통계 조회
 * - 현재 사용자와의 팔로우 관계 확인
 * - 본인 프로필인지 확인
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @clerk/nextjs/server: Clerk 인증
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/[userId]
 * 사용자 정보 조회
 *
 * Path Parameters:
 * - userId: 사용자 ID (UUID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // user_stats 뷰에서 사용자 정보 및 통계 조회
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError || !userStats) {
      logError(statsError, 'GET /api/users/[userId] - Fetch user stats');
      const errorMessage = statsError ? getSupabaseErrorMessage(statsError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // users 테이블에서 추가 정보 조회 (created_at 등)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, name, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logError(userError, 'GET /api/users/[userId] - Fetch user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 현재 사용자 정보 조회 (본인 프로필 확인 및 팔로우 관계 확인용)
    const { userId: clerkUserId } = await auth();
    let isOwnProfile = false;
    let isFollowing = false;

    if (clerkUserId) {
      // 본인 프로필인지 확인
      isOwnProfile = user.clerk_id === clerkUserId;

      // 다른 사람 프로필인 경우 팔로우 관계 확인
      if (!isOwnProfile) {
        // Clerk user ID로 현재 사용자의 users 테이블 ID 찾기
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUserId)
          .single();

        if (currentUser) {
          // follows 테이블에서 팔로우 관계 확인
          const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .single();

          isFollowing = !!follow;
        }
      }
    }

    // 응답 데이터 구성
    const response = {
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        name: user.name,
        created_at: user.created_at,
        posts_count: userStats.posts_count || 0,
        followers_count: userStats.followers_count || 0,
        following_count: userStats.following_count || 0,
        is_following: isFollowing,
        is_own_profile: isOwnProfile,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error, 'GET /api/users/[userId]');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]
 * 사용자 정보 업데이트
 *
 * Path Parameters:
 * - userId: 사용자 ID (UUID)
 *
 * Request Body:
 * - name: 사용자 이름 (선택사항, 최대 30자)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(401) },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logError(userError, 'PUT /api/users/[userId] - Fetch user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 본인 프로필인지 확인
    if (user.clerk_id !== clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(403, '본인의 프로필만 수정할 수 있습니다.') },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { name } = body;

    // 유효성 검사
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름은 문자열이어야 합니다.') },
          { status: 400 }
        );
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름을 입력해주세요.') },
          { status: 400 }
        );
      }

      if (trimmedName.length > 30) {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름은 30자 이하여야 합니다.') },
          { status: 400 }
        );
      }

      // 사용자 정보 업데이트
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ name: trimmedName })
        .eq('id', userId)
        .select('id, clerk_id, name, created_at')
        .single();

      if (updateError) {
        logError(updateError, 'PUT /api/users/[userId] - Update user');
        const errorMessage = getSupabaseErrorMessage(updateError);
        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: updatedUser,
        message: '프로필이 성공적으로 업데이트되었습니다.',
      });
    }

    // 업데이트할 필드가 없는 경우
    return NextResponse.json(
      { error: getErrorMessage(400, '업데이트할 정보가 없습니다.') },
      { status: 400 }
    );
  } catch (error) {
    logError(error, 'PUT /api/users/[userId]');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

