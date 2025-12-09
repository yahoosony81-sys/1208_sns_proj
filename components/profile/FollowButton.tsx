/**
 * @file FollowButton.tsx
 * @description 팔로우 버튼 컴포넌트
 *
 * Instagram 스타일 팔로우/언팔로우 버튼:
 * - "팔로우" 버튼 (파란색, 미팔로우 상태)
 * - "팔로잉" 버튼 (회색 테두리, 팔로우 중 상태)
 * - Hover 시 "언팔로우" 텍스트 표시 (빨간 테두리)
 * - 클릭 시 즉시 API 호출 및 낙관적 업데이트
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/types: User 타입
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FollowButtonProps {
  followingId: string; // 팔로우할 사용자 UUID
  isFollowing: boolean; // 현재 팔로우 상태
  onToggle?: (newState: boolean) => void; // 상태 변경 콜백 (선택사항)
  className?: string; // 추가 클래스명 (모바일에서 w-full 등)
}

export default function FollowButton({
  followingId,
  isFollowing: initialIsFollowing,
  onToggle,
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, setIsPending] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (isPending) return;

    // 낙관적 업데이트
    const newState = !isFollowing;
    setIsFollowing(newState);
    setIsPending(true);

    try {
      const url = '/api/follows';
      const method = newState ? 'POST' : 'DELETE';
      const body = JSON.stringify({ followingId });

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      if (!response.ok) {
        const data = await response.json();
        // 실패 시 롤백
        setIsFollowing(!newState);
        console.error('Follow toggle error:', data.error);
        // TODO: 토스트 메시지 표시 (추후 구현)
        return;
      }

      // 성공 시 콜백 호출
      if (onToggle) {
        onToggle(newState);
      }

      // 페이지 새로고침하여 통계 업데이트
      router.refresh();
    } catch (error) {
      // 실패 시 롤백
      setIsFollowing(!newState);
      console.error('Follow toggle error:', error);
      // TODO: 토스트 메시지 표시 (추후 구현)
    } finally {
      setIsPending(false);
    }
  };

  // 본인 프로필이면 버튼을 표시하지 않음 (이미 ProfileHeader에서 처리)
  // 하지만 안전을 위해 빈 div 반환
  if (!followingId) {
    return null;
  }

  // 팔로우 중 상태일 때 hover 효과
  const showUnfollow = isFollowing && isHovering;

  return (
    <Button
      variant={isFollowing ? 'outline' : 'default'}
      className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
        isFollowing
          ? showUnfollow
            ? 'border-red-500 text-red-500 hover:bg-red-50 hover:border-red-500'
            : 'border-instagram-border hover:bg-gray-50 text-instagram-text-primary'
          : 'bg-instagram-blue hover:bg-instagram-blue/90 text-white'
      } ${className}`}
      onClick={handleToggle}
      disabled={isPending}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {showUnfollow ? '언팔로우' : isFollowing ? '팔로잉' : '팔로우'}
    </Button>
  );
}

