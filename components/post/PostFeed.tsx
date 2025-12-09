/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록 렌더링 및 무한 스크롤:
 * - Intersection Observer를 사용한 무한 스크롤
 * - 페이지네이션 (10개씩)
 * - 로딩 상태 관리
 *
 * @dependencies
 * - components/post/PostCard: 게시물 카드
 * - components/post/PostCardSkeleton: 로딩 UI
 * - @/lib/types: PostWithUser 타입
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import type { PostWithUser } from '@/lib/types';

const POSTS_PER_PAGE = 10;

export default function PostFeed() {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(async (offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/posts?limit=${POSTS_PER_PAGE}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('게시물을 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      if (offset === 0) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.hasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPosts(posts.length);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, posts.length, fetchPosts]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchPosts(0)}
          className="px-4 py-2 bg-instagram-blue text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-instagram-text-secondary">
        <p className="text-lg mb-2">게시물이 없습니다.</p>
        <p className="text-sm">첫 게시물을 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} feedPosts={posts} />
      ))}

      {/* 로딩 스켈레톤 */}
      {loading && (
        <>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </>
      )}

      {/* 무한 스크롤 감지 타겟 */}
      {hasMore && !loading && (
        <div ref={observerTarget} className="h-4" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-instagram-text-secondary text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}
    </div>
  );
}

