/**
 * @file CommentForm.tsx
 * @description 댓글 입력 폼 컴포넌트
 *
 * Instagram 스타일 댓글 입력:
 * - 입력 필드: "댓글 달기..." 플레이스홀더
 * - Enter 키 또는 "게시" 버튼으로 제출
 * - Shift+Enter는 줄바꿈
 * - 로그인하지 않은 사용자 처리
 *
 * @dependencies
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @clerk/nextjs: useUser 훅
 * - @/lib/types: CommentWithUser 타입
 */

'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { CommentWithUser } from '@/lib/types';

interface CommentFormProps {
  postId: string;
  onSuccess?: (comment: CommentWithUser) => void;
}

function CommentForm({ postId, onSuccess }: CommentFormProps) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 댓글 제출 핸들러
  const handleSubmit = useCallback(async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      setError('댓글을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: trimmedContent,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '댓글 작성에 실패했습니다.');
      }

      // 성공 시 입력 필드 초기화 및 콜백 호출
      setContent('');
      onSuccess?.(data.comment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '댓글 작성에 실패했습니다.'
      );
      console.error('Error submitting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [content, postId, isSignedIn, router, onSuccess]);

  // Enter 키 처리 (Shift+Enter는 줄바꿈, Enter만 누르면 제출)
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // 입력값 변경 핸들러
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value);
    setError(null);
  }, []);

  return (
    <div className="border-t border-instagram-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="댓글 달기..."
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting || !isSignedIn}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isSignedIn || content.trim().length === 0}
          className="px-4 py-1 h-auto text-sm font-semibold text-instagram-blue hover:text-instagram-blue/80 disabled:text-instagram-text-secondary disabled:opacity-50"
          variant="ghost"
        >
          {isSubmitting ? '게시 중...' : '게시'}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

export default memo(CommentForm);

