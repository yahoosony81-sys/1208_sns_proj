/**
 * @file route.ts
 * @description 검색 API 라우트
 *
 * GET /api/search: 검색 쿼리 처리
 * - 사용자 검색: users 테이블에서 name 필드로 검색
 * - 게시물 검색: posts 테이블에서 caption 필드로 검색
 * - 쿼리 파라미터: q (검색어), type (all/users/posts)
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @/lib/types: User, PostWithUser 타입
 * - @/lib/errors: 에러 처리 유틸리티
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';
import type { User, PostWithUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * 검색 쿼리 처리
 *
 * Query Parameters:
 * - q: 검색어 (필수, 최소 2자)
 * - type: 검색 타입 (all/users/posts, 기본값: all)
 * - limit: 결과 제한 (기본값: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // 검색어 유효성 검사
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: getErrorMessage(400, '검색어는 최소 2자 이상이어야 합니다.') },
        { status: 400 }
      );
    }

    // limit 유효성 검사
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: getErrorMessage(400, 'limit은 1~100 사이여야 합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const results: {
      users: User[];
      posts: PostWithUser[];
    } = {
      users: [],
      posts: [],
    };

    // 사용자 검색
    if (type === 'all' || type === 'users') {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, clerk_id, name, profile_image_url, created_at')
        .ilike('name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (usersError) {
        logError(usersError, 'GET /api/search - Search users');
      } else {
        results.users = (users || []).map((user) => ({
          id: user.id,
          clerk_id: user.clerk_id,
          name: user.name,
          profile_image_url: user.profile_image_url || null,
          created_at: user.created_at,
        }));
      }
    }

    // 게시물 검색
    if (type === 'all' || type === 'posts') {
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(
          `
          *,
          user:users!posts_user_id_fkey (
            id,
            clerk_id,
            name,
            profile_image_url,
            created_at
          )
        `
        )
        .ilike('caption', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (postsError) {
        logError(postsError, 'GET /api/search - Search posts');
      } else {
        // 게시물 통계 조회
        const postIds = (posts || []).map((post) => post.id);
        let postsWithStats: PostWithUser[] = [];

        if (postIds.length > 0) {
          const { data: stats } = await supabase
            .from('post_stats')
            .select('post_id, likes_count, comments_count')
            .in('post_id', postIds);

          const statsMap = new Map(
            stats?.map((stat) => [stat.post_id, stat]) || []
          );

          postsWithStats = (posts || []).map((post) => {
            const stat = statsMap.get(post.id);
            const user = Array.isArray(post.user) ? post.user[0] : post.user;

            return {
              id: post.id,
              user_id: post.user_id,
              image_url: post.image_url,
              caption: post.caption,
              created_at: post.created_at,
              updated_at: post.updated_at,
              user: user || {
                id: '',
                clerk_id: '',
                name: '',
                profile_image_url: null,
                created_at: '',
              },
              likes_count: stat?.likes_count || 0,
              comments_count: stat?.comments_count || 0,
              is_liked: false, // 검색 결과에서는 좋아요 상태 확인하지 않음
            };
          });
        }

        results.posts = postsWithStats;
      }
    }

    return NextResponse.json({
      users: results.users,
      posts: results.posts,
      query,
      type,
    });
  } catch (error) {
    logError(error, 'GET /api/search');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

