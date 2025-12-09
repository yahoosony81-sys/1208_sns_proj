/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * Instagram 스타일 프로필 페이지:
 * - 동적 라우트: /profile/[userId]
 * - ProfileHeader: 프로필 정보 및 통계
 * - PostGrid: 게시물 그리드 (3열)
 *
 * @dependencies
 * - @/components/profile/ProfileHeader: 프로필 헤더
 * - @/components/profile/PostGrid: 게시물 그리드
 * - @/lib/types: User, PostWithUser 타입
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 */

import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PostGrid from '@/components/profile/PostGrid';
import type { User, PostWithUser, CommentWithUser } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  try {
    const supabase = await createClient();

    // user_stats 뷰에서 사용자 정보 및 통계 조회
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError || !userStats) {
      console.error('Error fetching user stats:', statsError);
      notFound();
    }

    // users 테이블에서 추가 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, name, profile_image_url, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      notFound();
    }

    // 타입 안전성을 위한 타입 단언
    type UserWithProfileImage = {
      id: string;
      clerk_id: string;
      name: string;
      profile_image_url: string | null;
      created_at: string;
    };
    const typedUser = user as UserWithProfileImage;

    // 현재 사용자 정보 조회 (본인 프로필 확인 및 팔로우 관계 확인용)
    const { userId: clerkUserId } = await auth();
    let isOwnProfile = false;
    let isFollowing = false;

    if (clerkUserId) {
      isOwnProfile = typedUser.clerk_id === clerkUserId;

      if (!isOwnProfile) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUserId)
          .single();

        if (currentUser) {
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

    // 사용자 게시물 목록 조회
    const { data: postsData, error: postsError } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      // 게시물 조회 실패해도 프로필은 표시
    }

    const posts = postsData || [];

    // 각 게시물에 대한 통계 조회
    const postIds = posts.map((post) => post.id);
    let postsWithStats: PostWithUser[] = [];

    if (postIds.length > 0) {
      const { data: stats } = await supabase
        .from('post_stats')
        .select('post_id, likes_count, comments_count')
        .in('post_id', postIds);

      const statsMap = new Map(
        stats?.map((stat) => [stat.post_id, stat]) || []
      );

      // 현재 사용자의 좋아요 상태 조회
      let userLikes: string[] = [];
      if (clerkUserId) {
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUserId)
          .single();

        if (currentUser) {
          const { data: likes } = await supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', currentUser.id)
            .in('post_id', postIds);

          userLikes = likes?.map((like) => like.post_id) || [];
        }
      }

      // 최신 댓글 2개 조회
      const { data: commentsData } = await supabase
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

      type CommentWithUserData = {
        id: string;
        post_id: string;
        content: string;
        created_at: string;
        updated_at: string;
        user: User | User[] | null;
      };

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

      const commentsByPost = new Map<string, CommentWithUserData[]>();
      if (commentsData) {
        for (const comment of commentsData) {
          const user = extractUser(comment.user);
          const typedComment: CommentWithUserData = {
            id: comment.id,
            post_id: comment.post_id,
            content: comment.content,
            created_at: comment.created_at,
            updated_at: comment.updated_at,
            user: user,
          };
          
          if (!commentsByPost.has(typedComment.post_id)) {
            commentsByPost.set(typedComment.post_id, []);
          }
          const postComments = commentsByPost.get(typedComment.post_id);
          if (postComments && postComments.length < 2) {
            postComments.push(typedComment);
          }
        }
      }

      // PostWithUser 타입으로 변환
      postsWithStats = posts.map((post) => {
        const stat = statsMap.get(post.id);
        const previewComments = commentsByPost.get(post.id) || [];
        return {
          ...post,
          user: Array.isArray(post.user) ? post.user[0] : post.user,
          likes_count: stat?.likes_count || 0,
          comments_count: stat?.comments_count || 0,
          is_liked: userLikes.includes(post.id),
          preview_comments: previewComments.map((comment): CommentWithUser => {
            const user = Array.isArray(comment.user) 
              ? comment.user[0] 
              : comment.user;
            
            return {
              id: comment.id,
              post_id: comment.post_id,
              user_id: user?.id || '',
              content: comment.content,
              created_at: comment.created_at,
              updated_at: comment.updated_at,
              user: user || { id: '', clerk_id: '', name: '', profile_image_url: null, created_at: '' },
            };
          }),
        };
      });
    }

    // User 타입으로 변환
    const userInfo: User = {
      id: typedUser.id,
      clerk_id: typedUser.clerk_id,
      name: typedUser.name,
      profile_image_url: typedUser.profile_image_url || null,
      created_at: typedUser.created_at,
    };

    return (
      <div className="w-full">
        {/* 프로필 헤더 */}
        <ProfileHeader
          userId={userId}
          user={userInfo}
          stats={{
            posts_count: userStats.posts_count || 0,
            followers_count: userStats.followers_count || 0,
            following_count: userStats.following_count || 0,
          }}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
        />

        {/* 구분선 */}
        <div className="border-t border-instagram-border my-4" />

        {/* 게시물 그리드 */}
        <PostGrid userId={userId} posts={postsWithStats} />
      </div>
    );
  } catch (error) {
    console.error('Error loading profile:', error);
    notFound();
  }
}

