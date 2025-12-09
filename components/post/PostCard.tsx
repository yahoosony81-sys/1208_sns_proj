/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일 게시물 카드:
 * - 헤더: 프로필 이미지 32px, 사용자명, 시간, ⋯ 메뉴
 * - 이미지: 1:1 정사각형
 * - 액션 버튼: 좋아요, 댓글, 공유, 북마크
 * - 컨텐츠: 좋아요 수, 캡션, 댓글 미리보기
 *
 * @dependencies
 * - @/lib/types: PostWithUser 타입
 * - lucide-react: 아이콘
 * - next/image: 이미지 최적화
 * - next/link: 네비게이션
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import type { PostWithUser, CommentWithUser } from '@/lib/types';
import CommentForm from '@/components/comment/CommentForm';
import CommentList from '@/components/comment/CommentList';

/**
 * 시간을 상대적 형식으로 변환 (예: "3시간 전")
 */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '방금 전';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}일 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}년 전`;
}

interface PostCardProps {
  post: PostWithUser;
}

export default function PostCard({ post }: PostCardProps) {
  const timeAgo = formatTimeAgo(post.created_at);

  // 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 댓글 상태 관리
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [previewComments, setPreviewComments] = useState<CommentWithUser[]>(
    post.preview_comments || []
  );

  // 더블탭 감지를 위한 타이머
  const lastTapRef = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // 캡션 처리: 2줄 초과 시 "... 더 보기" 표시
  const captionLines = post.caption?.split('\n') || [];
  const showMore = captionLines.length > 2 || (post.caption && post.caption.length > 100);
  const displayCaption = showMore
    ? post.caption?.substring(0, 100) + '...'
    : post.caption;

  // 좋아요 토글 처리
  const handleLike = useCallback(async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트 (Optimistic Update)
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);
    setIsAnimating(true);

    try {
      const url = '/api/likes';
      const method = newIsLiked ? 'POST' : 'DELETE';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        // 실패 시 원래 상태로 복구
        setIsLiked(isLiked);
        setLikesCount(likesCount);
        const error = await response.json();
        console.error('Like error:', error);
      }
    } catch (error) {
      // 에러 시 원래 상태로 복구
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      console.error('Like error:', error);
    } finally {
      setIsLikeLoading(false);
      setTimeout(() => setIsAnimating(false), 150);
    }
  }, [isLiked, likesCount, post.id, isLikeLoading]);

  // 더블탭 좋아요 처리
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms 내 두 번 탭하면 더블탭으로 간주

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // 더블탭 감지
      if (!isLiked) {
        handleLike();
        // 큰 하트 애니메이션 표시
        setShowDoubleTapHeart(true);
        setTimeout(() => {
          setShowDoubleTapHeart(false);
        }, 1000);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [isLiked, handleLike]);

  // 댓글 작성 성공 핸들러
  const handleCommentSuccess = useCallback((comment: CommentWithUser) => {
    // 댓글 수 증가
    setCommentsCount((prev) => prev + 1);
    // preview_comments 업데이트 (최신 댓글 추가, 최대 2개만 유지)
    setPreviewComments((prev) => {
      const newComments = [comment, ...prev];
      return newComments.slice(0, 2);
    });
  }, []);

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback((commentId: string) => {
    // 댓글 수 감소
    setCommentsCount((prev) => Math.max(0, prev - 1));
    // preview_comments에서 제거
    setPreviewComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  return (
    <article className="bg-white border border-instagram-border rounded-lg mb-6 overflow-hidden">
      {/* 헤더 (60px) */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-instagram-border">
        <Link
          href={`/profile/${post.user.id}`}
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
            {/* 프로필 이미지 - 추후 사용자 프로필 이미지 추가 시 사용 */}
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-instagram-text-primary">
              {post.user.name}
            </span>
            <span className="text-xs text-instagram-text-secondary">{timeAgo}</span>
          </div>
        </Link>
        <button
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="더보기"
        >
          <MoreHorizontal className="w-5 h-5 text-instagram-text-primary" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div
        ref={imageRef}
        className="relative w-full aspect-square bg-gray-100 cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
        onClick={handleDoubleTap}
      >
        <Image
          src={post.image_url}
          alt={post.caption || '게시물 이미지'}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
          draggable={false}
        />
        {/* 더블탭 큰 하트 애니메이션 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart
              className="w-24 h-24 fill-instagram-like text-instagram-like"
              style={{
                animation: 'heartPulse 1s ease-out',
              }}
            />
          </div>
        )}
      </div>

      {/* 액션 버튼 (48px) */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isLikeLoading}
            className="hover:opacity-70 transition-opacity disabled:opacity-50"
            aria-label={isLiked ? '좋아요 취소' : '좋아요'}
          >
            <Heart
              className={`w-6 h-6 transition-transform duration-150 ${
                isLiked
                  ? 'fill-instagram-like text-instagram-like'
                  : 'text-instagram-text-primary'
              } ${isAnimating ? 'scale-[1.3]' : 'scale-100'}`}
            />
          </button>
          <Link
            href={`/post/${post.id}`}
            className="hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-instagram-text-primary" />
          </Link>
          <button
            className="hover:opacity-70 transition-opacity"
            aria-label="공유"
            disabled
          >
            <Send className="w-6 h-6 text-instagram-text-primary opacity-50" />
          </button>
        </div>
        <button
          className="hover:opacity-70 transition-opacity"
          aria-label="북마크"
          disabled
        >
          <Bookmark className="w-6 h-6 text-instagram-text-primary opacity-50" />
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="text-sm font-semibold text-instagram-text-primary">
            좋아요 {likesCount.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-sm text-instagram-text-primary">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold hover:opacity-70 transition-opacity"
            >
              {post.user.name}
            </Link>
            <span className="ml-2">{displayCaption}</span>
            {showMore && (
              <button className="ml-1 text-instagram-text-secondary hover:opacity-70">
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 (최신 2개) */}
        {commentsCount > 0 && (
          <div className="space-y-1">
            {commentsCount > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-sm text-instagram-text-secondary hover:opacity-70 transition-opacity block"
              >
                댓글 {commentsCount}개 모두 보기
              </Link>
            )}
            {/* 댓글 목록 (CommentList 사용) */}
            {previewComments.length > 0 && (
              <CommentList
                comments={previewComments}
                onDelete={handleCommentDelete}
                showDeleteButton={true}
              />
            )}
          </div>
        )}
      </div>

      {/* 댓글 입력 폼 */}
      <CommentForm postId={post.id} onSuccess={handleCommentSuccess} />
    </article>
  );
}

