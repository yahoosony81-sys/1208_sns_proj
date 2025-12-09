/**
 * @file route.ts
 * @description 게시물 API 라우트
 *
 * GET /api/posts: 게시물 목록 조회
 * - 시간 역순 정렬
 * - 페이지네이션 지원 (limit, offset)
 * - userId 파라미터 지원 (프로필 페이지용)
 * - 사용자 정보 및 통계 포함
 *
 * POST /api/posts: 게시물 생성
 * - 이미지 파일 업로드 (Supabase Storage)
 * - 캡션 입력 (최대 2,200자)
 * - 파일 검증 (최대 5MB, JPEG/PNG/WebP)
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';
import type { PostWithUser, CommentWithUser, User } from '@/lib/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STORAGE_BUCKET = 'posts';

export const dynamic = 'force-dynamic';

/**
 * GET /api/posts
 * 게시물 목록 조회
 *
 * Query Parameters:
 * - limit: 페이지당 게시물 수 (기본값: 10)
 * - offset: 건너뛸 게시물 수 (기본값: 0)
 * - userId: 특정 사용자의 게시물만 조회 (선택사항)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const userId = searchParams.get('userId');

    const supabase = await createClient();

    // 기본 쿼리: posts 테이블과 users 테이블 조인
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey (
          id,
          clerk_id,
          name,
          profile_image_url,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // userId가 제공된 경우 필터링
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      logError(postsError, 'GET /api/posts - Fetch posts');
      const errorMessage = getSupabaseErrorMessage(postsError);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({ posts: [], hasMore: false });
    }

    // 각 게시물에 대한 통계 및 좋아요 상태 조회
    const postIds = posts.map((post) => post.id);

    // 좋아요 수 및 댓글 수 조회 (post_stats 뷰 사용)
    const { data: stats, error: statsError } = await supabase
      .from('post_stats')
      .select('post_id, likes_count, comments_count')
      .in('post_id', postIds);

    if (statsError) {
      logError(statsError, 'GET /api/posts - Fetch stats');
      // 통계 조회 실패해도 게시물은 반환
    }

    // 현재 사용자의 좋아요 상태 조회
    const { userId: clerkUserId } = await auth();
    let userLikes: string[] = [];

    if (clerkUserId) {
      // Clerk user ID로 users 테이블에서 사용자 찾기
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUserId)
        .single();

      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        userLikes = likes?.map((like) => like.post_id) || [];
      }
    }

    // 통계 맵 생성
    const statsMap = new Map(
      stats?.map((stat) => [stat.post_id, stat]) || []
    );

    // 각 게시물의 최신 댓글 2개 조회
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
      .in('post_id', postIds)
      .order('created_at', { ascending: false });

    if (commentsError) {
      logError(commentsError, 'GET /api/posts - Fetch comments');
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

    // 게시물별 댓글 그룹화 (최신 2개만)
    const commentsByPost = new Map<string, Array<typeof commentsData[0]>>();
    commentsData?.forEach((comment) => {
      if (!commentsByPost.has(comment.post_id)) {
        commentsByPost.set(comment.post_id, []);
      }
      const postComments = commentsByPost.get(comment.post_id);
      if (postComments && postComments.length < 2) {
        postComments.push(comment);
      }
    });

    // PostWithUser 타입으로 변환
    const postsWithUser: PostWithUser[] = posts.map((post) => {
      const stat = statsMap.get(post.id);
      const previewComments = commentsByPost.get(post.id) || [];
      return {
        ...post,
        user: Array.isArray(post.user) ? post.user[0] : post.user,
        likes_count: stat?.likes_count || 0,
        comments_count: stat?.comments_count || 0,
        is_liked: userLikes.includes(post.id),
        preview_comments: previewComments.map((comment): CommentWithUser => {
          const user = extractUser(comment.user);
          const defaultUser: User = { id: '', clerk_id: '', name: '', profile_image_url: null, created_at: '' };
          return {
            id: comment.id,
            post_id: comment.post_id,
            user_id: user?.id || '',
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user: user || defaultUser,
          };
        }),
      };
    });

    // 더 많은 게시물이 있는지 확인
    const totalCount = userId
      ? (
          await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
        ).count || 0
      : (
          await supabase
            .from('posts')
            .select('id', { count: 'exact', head: true })
        ).count || 0;

    const hasMore = offset + limit < totalCount;

    return NextResponse.json({
      posts: postsWithUser,
      hasMore,
      total: totalCount,
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
 * POST /api/posts
 * 게시물 생성
 *
 * Body (FormData):
 * - image: 이미지 파일 (필수)
 * - caption: 캡션 (선택사항, 최대 2,200자)
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

    const supabase = await createClient();

    // Clerk user ID로 users 테이블에서 사용자 찾기
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (userError || !user) {
      logError(userError, 'POST /api/posts - Find user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const caption = formData.get('caption') as string | null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json(
        { error: getErrorMessage(400, '이미지 파일이 필요합니다.') },
        { status: 400 }
      );
    }

    // 파일 크기 검증
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: getErrorMessage(413, '파일 크기는 5MB 이하여야 합니다.') },
        { status: 413 }
      );
    }

    // MIME 타입 검증
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: getErrorMessage(415, 'JPEG, PNG, WebP 파일만 업로드 가능합니다.') },
        { status: 415 }
      );
    }

    // 캡션 검증
    if (caption && caption.length > 2200) {
      return NextResponse.json(
        { error: getErrorMessage(400, '캡션은 최대 2,200자까지 입력 가능합니다.') },
        { status: 400 }
      );
    }

    // 파일 확장자 추출
    const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    // Supabase Storage에 이미지 업로드
    const fileBuffer = await imageFile.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: imageFile.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      logError(uploadError, 'POST /api/posts - Upload image');
      const errorMessage = getSupabaseErrorMessage(uploadError);
      return NextResponse.json(
        { error: errorMessage || '이미지 업로드에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    // posts 테이블에 데이터 저장
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption?.trim() || null,
      })
      .select()
      .single();

    if (postError) {
      logError(postError, 'POST /api/posts - Create post');
      // 업로드된 파일 삭제 시도 (실패해도 계속 진행)
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      const errorMessage = getSupabaseErrorMessage(postError);
      return NextResponse.json(
        { error: errorMessage || '게시물 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from('users')
      .select('id, clerk_id, name, created_at')
      .eq('id', user.id)
      .single();

    // PostWithUser 타입으로 변환
    const postWithUser: PostWithUser = {
      ...post,
      user: userData || {
        id: user.id,
        clerk_id: clerkUserId,
        name: '',
        created_at: new Date().toISOString(),
      },
      likes_count: 0,
      comments_count: 0,
      is_liked: false,
      preview_comments: [],
    };

    return NextResponse.json(
      { success: true, post: postWithUser },
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

