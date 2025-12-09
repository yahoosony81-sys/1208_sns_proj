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
        { error: '사용자 ID가 필요합니다.' },
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
      console.error('Error fetching user stats:', statsError);
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
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
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
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
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

