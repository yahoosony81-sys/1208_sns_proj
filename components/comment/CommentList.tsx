/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일 댓글 목록:
 * - 댓글 목록 렌더링
 * - 삭제 버튼 (본인 댓글만 표시)
 * - 사용자명 클릭 시 프로필 페이지로 이동
 * - 시간 표시 (상대적 시간)
 *
 * @dependencies
 * - @/lib/types: CommentWithUser 타입
 * - @clerk/nextjs: useUser 훅
 * - next/link: 네비게이션
 * - lucide-react: 아이콘
 */

'use client';

import { useState, useCallback, memo } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import type { CommentWithUser } from '@/lib/types';

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

interface CommentListProps {
  comments: CommentWithUser[];
  onDelete?: (commentId: string) => void;
  showDeleteButton?: boolean; // 본인 댓글만 삭제 버튼 표시
}

function CommentList({
  comments,
  onDelete,
  showDeleteButton = true,
}: CommentListProps) {
  const { user } = useUser();
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // 댓글 삭제 핸들러
  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!confirm('댓글을 삭제하시겠습니까?')) {
        return;
      }

      setDeletingCommentId(commentId);

      try {
        const response = await fetch('/api/comments', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ commentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '댓글 삭제에 실패했습니다.');
        }

        // 삭제 성공 시 콜백 호출
        onDelete?.(commentId);
      } catch (err) {
        console.error('Error deleting comment:', err);
        alert(
          err instanceof Error ? err.message : '댓글 삭제에 실패했습니다.'
        );
      } finally {
        setDeletingCommentId(null);
      }
    },
    [onDelete]
  );

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {comments.map((comment) => {
        const isOwnComment = user?.id === comment.user.clerk_id;
        const canDelete = showDeleteButton && isOwnComment;

        return (
          <div
            key={comment.id}
            className="flex items-start gap-2 group hover:bg-gray-50/50 rounded px-1 py-0.5 -mx-1 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm text-instagram-text-primary">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold hover:opacity-70 transition-opacity"
                >
                  {comment.user.name}
                </Link>
                <span className="ml-2">{comment.content}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-instagram-text-secondary">
                  {formatTimeAgo(comment.created_at)}
                </span>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingCommentId === comment.id}
                    className="text-xs text-instagram-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    aria-label="댓글 삭제"
                  >
                    {deletingCommentId === comment.id ? '삭제 중...' : '삭제'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default memo(CommentList);

