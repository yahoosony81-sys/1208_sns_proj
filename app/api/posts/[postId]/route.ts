/**
 * @file route.ts
 * @description 단일 게시물 조회 API 라우트
 *
 * GET /api/posts/[postId]: 단일 게시물 상세 정보 조회
 * - 게시물 정보 (이미지, 캡션, 작성자, 시간)
 * - 좋아요 수, 댓글 수, 좋아요 상태
 * - 전체 댓글 목록 (시간 역순 정렬)
 * - 사용자 정보 포함
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import type { PostWithUser, CommentWithUser } from '@/lib/types';

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
          created_at
        )
      `
      )
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return NextResponse.json(
        { error: '게시물을 찾을 수 없습니다.' },
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
      console.error('Error fetching stats:', statsError);
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
          created_at
        )
      `
      )
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      // 댓글 조회 실패해도 게시물은 반환
    }

    // CommentWithUser 타입으로 변환
    const comments: CommentWithUser[] =
      commentsData?.map((comment) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: Array.isArray(comment.user)
          ? comment.user[0]?.id || ''
          : comment.user?.id || '',
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        user: Array.isArray(comment.user)
          ? comment.user[0]
          : comment.user,
      })) || [];

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

