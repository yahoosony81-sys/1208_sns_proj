/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * Instagram 스타일 게시물 상세 모달:
 * - Desktop: 모달 형식 (이미지 50% + 댓글 50%)
 * - Mobile: 전체 페이지 형식
 * - 댓글 전체 목록 표시
 * - 좋아요 기능
 * - 이전/다음 게시물 네비게이션 (Desktop만)
 *
 * @dependencies
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/components/comment/CommentList: 댓글 목록
 * - @/components/comment/CommentForm: 댓글 입력
 * - @/lib/types: PostWithUser, CommentWithUser 타입
 * - lucide-react: 아이콘
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import CommentList from '@/components/comment/CommentList';
import CommentForm from '@/components/comment/CommentForm';
import type { PostWithUser, CommentWithUser } from '@/lib/types';

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

interface PostModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPost?: PostWithUser; // 선택사항: 초기 게시물 데이터
  feedPosts?: PostWithUser[]; // 선택사항: 이전/다음 게시물 네비게이션용
}

export default function PostModal({
  postId,
  open,
  onOpenChange,
  initialPost,
  feedPosts = [],
}: PostModalProps) {
  const [post, setPost] = useState<PostWithUser | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(initialPost?.is_liked || false);
  const [likesCount, setLikesCount] = useState(initialPost?.likes_count || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>(
    initialPost?.preview_comments || []
  );
  const [commentsCount, setCommentsCount] = useState(
    initialPost?.comments_count || 0
  );

  // 현재 postId를 상태로 관리 (이전/다음 게시물 네비게이션용)
  const [currentPostId, setCurrentPostId] = useState(postId);

  // postId가 변경되면 currentPostId 업데이트
  useEffect(() => {
    if (postId !== currentPostId && open) {
      setCurrentPostId(postId);
    }
  }, [postId, open, currentPostId]);

  // currentPostId가 변경되면 게시물 로드
  useEffect(() => {
    if (open && currentPostId && currentPostId !== post?.id) {
      loadPost();
    }
  }, [currentPostId, open, post?.id, loadPost]);

  // 이전/다음 게시물 계산 (메모이제이션)
  const { previousPost, nextPost } = useMemo(() => {
    const currentIndex = feedPosts.findIndex((p) => p.id === currentPostId);
    const prev = currentIndex > 0 ? feedPosts[currentIndex - 1] : null;
    const next =
      currentIndex >= 0 && currentIndex < feedPosts.length - 1
        ? feedPosts[currentIndex + 1]
        : null;
    return { previousPost: prev, nextPost: next };
  }, [feedPosts, currentPostId]);

  // 게시물 상세 정보 로드
  const loadPost = useCallback(async () => {
    if (!currentPostId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${currentPostId}`);

      if (!response.ok) {
        throw new Error('게시물을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      const loadedPost = data.post;
      const loadedComments = data.comments || [];

      setPost(loadedPost);
      setIsLiked(loadedPost.is_liked);
      setLikesCount(loadedPost.likes_count);
      setComments(loadedComments);
      setCommentsCount(loadedPost.comments_count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
      console.error('Error loading post:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPostId]);

  // 모달이 열릴 때 게시물 로드
  useEffect(() => {
    if (open) {
      if (currentPostId === postId && initialPost) {
        // 초기 데이터가 있고 postId가 변경되지 않았으면 그것을 사용
        setPost(initialPost);
        setIsLiked(initialPost.is_liked);
        setLikesCount(initialPost.likes_count);
        setCommentsCount(initialPost.comments_count);
        // 전체 댓글은 별도로 로드
        loadPost();
      } else {
        // postId가 변경되었거나 초기 데이터가 없으면 새로 로드
        loadPost();
      }
    }
  }, [open, currentPostId, postId, initialPost, loadPost]);

  // 좋아요 토글 처리
  const handleLike = useCallback(async () => {
    if (isLikeLoading || !post) return;

    setIsLikeLoading(true);
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;

    // 낙관적 업데이트
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
  }, [isLiked, likesCount, post, isLikeLoading]);

  // 댓글 작성 성공 핸들러
  const handleCommentSuccess = useCallback((comment: CommentWithUser) => {
    setCommentsCount((prev) => prev + 1);
    setComments((prev) => [comment, ...prev]);
  }, []);

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback((commentId: string) => {
    setCommentsCount((prev) => Math.max(0, prev - 1));
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  // 이전 게시물로 이동
  const handlePreviousPost = useCallback(() => {
    if (previousPost && !isLoading) {
      setCurrentPostId(previousPost.id);
      setError(null);
    }
  }, [previousPost, isLoading]);

  // 다음 게시물로 이동
  const handleNextPost = useCallback(() => {
    if (nextPost && !isLoading) {
      setCurrentPostId(nextPost.id);
      setError(null);
    }
  }, [nextPost, isLoading]);

  // 키보드 이벤트 처리 (ESC, 화살표 키)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      } else if (e.key === 'ArrowLeft' && previousPost) {
        e.preventDefault();
        handlePreviousPost();
      } else if (e.key === 'ArrowRight' && nextPost) {
        e.preventDefault();
        handleNextPost();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, previousPost, nextPost, handlePreviousPost, handleNextPost]);

  // 모달 닫기
  const handleClose = useCallback(() => {
    // 모달이 닫힐 때 상태 초기화
    setCurrentPostId(postId);
    setError(null);
    onOpenChange(false);
  }, [onOpenChange, postId]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setCurrentPostId(postId);
      setError(null);
    }
  }, [open, postId]);

  if (!open) return null;

  const timeAgo = post ? formatTimeAgo(post.created_at) : '';

  // Mobile 레이아웃 (전체 페이지 형식)
  const mobileContent = (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto md:hidden">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-instagram-border flex items-center justify-between px-4 py-3 h-[60px]">
        <button
          onClick={handleClose}
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="닫기"
        >
          <X className="w-6 h-6 text-instagram-text-primary" />
        </button>
        <h2 className="text-lg font-semibold text-instagram-text-primary">
          게시물
        </h2>
        <div className="w-6" /> {/* 공간 확보 */}
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="w-full max-w-md space-y-4">
            {/* 이미지 스켈레톤 */}
            <div className="relative w-full aspect-square bg-gray-200 rounded-lg animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
            {/* 컨텐츠 스켈레톤 */}
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={loadPost}
            className="px-4 py-2 bg-instagram-blue text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            다시 시도
          </button>
        </div>
      ) : post ? (
        <>
          {/* 이미지 영역 */}
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={post.image_url}
              alt={post.caption || '게시물 이미지'}
              fill
              className="object-cover"
              sizes="100vw"
              priority
              draggable={false}
            />
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-instagram-border">
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
              <button
                className="hover:opacity-70 transition-opacity"
                aria-label="댓글"
                disabled
              >
                <MessageCircle className="w-6 h-6 text-instagram-text-primary opacity-50" />
              </button>
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
          <div className="px-4 py-3 space-y-3">
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
                <span className="ml-2">{post.caption}</span>
              </div>
            )}

            {/* 댓글 목록 */}
            {comments.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto">
                <CommentList
                  comments={comments}
                  onDelete={handleCommentDelete}
                  showDeleteButton={true}
                />
              </div>
            )}
          </div>

          {/* 댓글 입력 폼 */}
          <div className="sticky bottom-0 bg-white border-t border-instagram-border">
            <CommentForm postId={post.id} onSuccess={handleCommentSuccess} />
          </div>
        </>
      ) : null}
    </div>
  );

  // Desktop 레이아웃 (모달 형식)
  const desktopContent = (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[90vw] max-w-[1200px] w-full h-[90vh] p-0 flex flex-col md:flex-row overflow-hidden"
        aria-labelledby="post-modal-title"
      >
        <DialogTitle id="post-modal-title" className="sr-only">
          {post ? `${post.user.name}의 게시물` : '게시물 상세'}
        </DialogTitle>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full bg-white">
            <div className="w-full h-full flex flex-col md:flex-row">
              {/* 좌측 이미지 스켈레톤 */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-full bg-gray-200 animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
              {/* 우측 컨텐츠 스켈레톤 */}
              <div className="w-full md:w-1/2 h-[50vh] md:h-full flex flex-col bg-white">
                <div className="px-4 py-3 border-b border-instagram-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-4 py-2 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center w-full h-full px-4">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={loadPost}
              className="px-4 py-2 bg-instagram-blue text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        ) : post ? (
          <>
            {/* 좌측: 이미지 영역 (50%) */}
            <div className="relative w-full md:w-1/2 h-[50vh] md:h-full bg-black flex items-center justify-center">
              <Image
                src={post.image_url}
                alt={post.caption || '게시물 이미지'}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                draggable={false}
              />

              {/* 이전/다음 게시물 네비게이션 버튼 (Desktop만) */}
              {previousPost && !isLoading && (
                <button
                  onClick={handlePreviousPost}
                  disabled={isLoading}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="이전 게시물"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {nextPost && !isLoading && (
                <button
                  onClick={handleNextPost}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="다음 게시물"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* 우측: 댓글 영역 (50%) */}
            <div className="w-full md:w-1/2 h-[50vh] md:h-full flex flex-col bg-white">
              {/* 헤더 */}
              <header className="flex items-center justify-between px-4 py-3 border-b border-instagram-border">
                <Link
                  href={`/profile/${post.user.id}`}
                  className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-instagram-text-primary">
                      {post.user.name}
                    </span>
                    <span className="text-xs text-instagram-text-secondary">
                      {timeAgo}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleClose}
                  className="p-1 hover:opacity-70 transition-opacity"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-instagram-text-primary" />
                </button>
              </header>

              {/* 스크롤 가능한 컨텐츠 영역 */}
              <div className="flex-1 overflow-y-auto">
                {/* 액션 버튼 */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-instagram-border">
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
                    <button
                      className="hover:opacity-70 transition-opacity"
                      aria-label="댓글"
                      disabled
                    >
                      <MessageCircle className="w-6 h-6 text-instagram-text-primary opacity-50" />
                    </button>
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

                {/* 좋아요 수 */}
                {likesCount > 0 && (
                  <div className="px-4 py-2 text-sm font-semibold text-instagram-text-primary">
                    좋아요 {likesCount.toLocaleString()}개
                  </div>
                )}

                {/* 캡션 */}
                {post.caption && (
                  <div className="px-4 py-2 text-sm text-instagram-text-primary">
                    <Link
                      href={`/profile/${post.user.id}`}
                      className="font-semibold hover:opacity-70 transition-opacity"
                    >
                      {post.user.name}
                    </Link>
                    <span className="ml-2">{post.caption}</span>
                  </div>
                )}

                {/* 댓글 목록 */}
                {comments.length > 0 ? (
                  <div className="px-4 py-2">
                    <CommentList
                      comments={comments}
                      onDelete={handleCommentDelete}
                      showDeleteButton={true}
                    />
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-instagram-text-secondary text-sm">
                    댓글이 없습니다. 첫 댓글을 작성해보세요!
                  </div>
                )}
              </div>

              {/* 댓글 입력 폼 (하단 고정) */}
              <div className="border-t border-instagram-border">
                <CommentForm postId={post.id} onSuccess={handleCommentSuccess} />
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );

  // Mobile에서는 전체 페이지, Desktop에서는 모달
  return (
    <>
      {mobileContent}
      <div className="hidden md:block">{desktopContent}</div>
    </>
  );
}

