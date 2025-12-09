/**
 * @file route.ts
 * @description 단일 게시물 조회 및 삭제 API 라우트
 *
 * GET /api/posts/[postId]: 단일 게시물 상세 정보 조회
 * DELETE /api/posts/[postId]: 게시물 삭제
 * - 본인만 삭제 가능 (인증 검증)
 * - Supabase Storage에서 이미지 삭제
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @/lib/supabase/service-role: Supabase Service Role 클라이언트 (Storage 삭제용)
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';
import type { PostWithUser, CommentWithUser, User } from '@/lib/types';

const STORAGE_BUCKET = 'posts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts/[postId]
 * 단일 게시물 상세 정보 조회
 *
 * Path Parameters:
 * - postId: 게시물 ID (UUID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: '게시물 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 게시물 조회 (사용자 정보 포함)
    const { data: post, error: postError } = await supabase
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
      .eq('id', postId)
      .single();

    if (postError || !post) {
      logError(postError, 'GET /api/posts/[postId] - Fetch post');
      const errorMessage = postError ? getSupabaseErrorMessage(postError) : '게시물을 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 게시물 통계 조회 (좋아요 수, 댓글 수)
    const { data: stats, error: statsError } = await supabase
      .from('post_stats')
      .select('post_id, likes_count, comments_count')
      .eq('post_id', postId)
      .single();

    if (statsError) {
      logError(statsError, 'GET /api/posts/[postId] - Fetch stats');
      // 통계 조회 실패해도 게시물은 반환
    }

    // 현재 사용자의 좋아요 상태 조회
    const { userId: clerkUserId } = await auth();
    let isLiked = false;

    if (clerkUserId) {
      // Clerk user ID로 users 테이블에서 사용자 찾기
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single();

      if (user) {
        const { data: like } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();

        isLiked = !!like;
      }
    }

    // 전체 댓글 목록 조회 (시간 역순 정렬)
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(
        `
        id,
        post_id,
        content,
        created_at,
        updated_at,
        user:users!comments_user_id_fkey (
          id,
          clerk_id,
          name,
          profile_image_url,
          created_at
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      logError(commentsError, 'GET /api/posts/[postId] - Fetch comments');
      // 댓글 조회 실패해도 게시물은 반환
    }

    // Helper function to extract user from comment data
    const extractUser = (userData: unknown): User | null => {
      if (!userData) return null;
      if (Array.isArray(userData)) {
        return userData[0] || null;
      }
      if (typeof userData === 'object' && userData !== null && 'id' in userData) {
        return userData as User;
      }
      return null;
    };

    // CommentWithUser 타입으로 변환
    const comments: CommentWithUser[] =
      commentsData?.map((comment) => {
        const user = extractUser(comment.user);
        return {
          id: comment.id,
          post_id: comment.post_id,
          user_id: user?.id || '',
          content: comment.content,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          user: user || { id: '', clerk_id: '', name: '', created_at: '' },
        };
      }) || [];

    // PostWithUser 타입으로 변환
    const postWithUser: PostWithUser = {
      ...post,
      user: Array.isArray(post.user) ? post.user[0] : post.user,
      likes_count: stats?.likes_count || 0,
      comments_count: stats?.comments_count || 0,
      is_liked: isLiked,
      preview_comments: comments, // 전체 댓글을 preview_comments에 포함
    };

    return NextResponse.json({
      post: postWithUser,
      comments, // 별도로 댓글 목록도 반환
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/posts/[postId]
 * 게시물 삭제
 *
 * Path Parameters:
 * - postId: 게시물 ID (UUID)
 *
 * 본인 게시물만 삭제 가능하며, Storage 이미지도 함께 삭제됩니다.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '게시물 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(401) },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 현재 사용자 찾기
    const { data: currentUser, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !currentUser) {
      logError(userError, 'DELETE /api/posts/[postId] - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 게시물 조회 (작성자 확인용)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, user_id, image_url')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      const errorMessage = postError ? getSupabaseErrorMessage(postError) : '게시물을 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 본인 게시물인지 확인
    if (post.user_id !== currentUser.id) {
      return NextResponse.json(
        { error: getErrorMessage(403, '본인이 작성한 게시물만 삭제할 수 있습니다.') },
        { status: 403 }
      );
    }

    // Storage에서 이미지 파일 경로 추출
    // image_url 형식: https://[project].supabase.co/storage/v1/object/public/posts/{clerk_id}/{filename}
    let filePath: string | null = null;
    try {
      const url = new URL(post.image_url);
      const pathParts = url.pathname.split('/');
      const postsIndex = pathParts.indexOf('posts');
      if (postsIndex >= 0 && postsIndex < pathParts.length - 1) {
        // posts 이후의 경로 추출 (clerk_id/filename)
        filePath = pathParts.slice(postsIndex + 1).join('/');
      }
    } catch (urlError) {
      console.error('Error parsing image URL:', urlError);
      // URL 파싱 실패해도 게시물은 삭제 진행
    }

    // Supabase Storage에서 이미지 삭제 (Service Role 클라이언트 사용)
    if (filePath) {
      try {
        const serviceRoleClient = getServiceRoleClient();
        const { error: storageError } = await serviceRoleClient.storage
          .from(STORAGE_BUCKET)
          .remove([filePath]);

        if (storageError) {
          logError(storageError, 'DELETE /api/posts/[postId] - Delete image from storage');
          // Storage 삭제 실패해도 게시물은 삭제 진행 (에러 로그만 기록)
        }
      } catch (storageError) {
        logError(storageError, 'DELETE /api/posts/[postId] - Delete image from storage (catch)');
        // Storage 삭제 실패해도 게시물은 삭제 진행
      }
    }

    // posts 테이블에서 게시물 삭제 (CASCADE로 관련 데이터 자동 삭제)
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', currentUser.id);

    if (deleteError) {
      logError(deleteError, 'DELETE /api/posts/[postId] - Delete post');
      const errorMessage = getSupabaseErrorMessage(deleteError);
      return NextResponse.json(
        { error: errorMessage || '게시물을 삭제하는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logError(error, 'DELETE /api/posts/[postId]');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

