/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * Instagram 스타일 프로필 헤더:
 * - 프로필 이미지 (150px Desktop / 90px Mobile)
 * - 사용자명
 * - 통계 (게시물 수, 팔로워 수, 팔로잉 수)
 * - "팔로우" / "팔로잉" 버튼 (다른 사람 프로필)
 * - "프로필 편집" 버튼 (본인 프로필, 1차에서는 UI만)
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 * - @/lib/types: User 타입
 */

'use client';

import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';

interface ProfileHeaderProps {
  userId: string;
  user: User;
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
  };
  isOwnProfile: boolean;
  isFollowing?: boolean; // 다른 사람 프로필일 때만
}

export default function ProfileHeader({
  userId,
  user,
  stats,
  isOwnProfile,
  isFollowing = false,
}: ProfileHeaderProps) {
  return (
    <div className="w-full">
      {/* Desktop: 가로 레이아웃 */}
      <div className="hidden md:flex items-start gap-8 px-4 py-8">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          <div className="relative w-[150px] h-[150px] rounded-full overflow-hidden bg-gray-200">
            {/* 프로필 이미지 - 추후 사용자 프로필 이미지 추가 시 사용 */}
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="flex-1 min-w-0">
          {/* 사용자명 및 버튼 */}
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-light text-instagram-text-primary">
              {user.name}
            </h1>
            {isOwnProfile ? (
              <Button
                variant="outline"
                className="px-4 py-1.5 text-sm font-semibold border-instagram-border hover:bg-gray-50"
                disabled
              >
                프로필 편집
              </Button>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                className={`px-4 py-1.5 text-sm font-semibold ${
                  isFollowing
                    ? 'border-instagram-border hover:bg-gray-50 text-instagram-text-primary'
                    : 'bg-instagram-blue hover:bg-instagram-blue/90 text-white'
                }`}
                disabled
              >
                {isFollowing ? '팔로잉' : '팔로우'}
              </Button>
            )}
          </div>

          {/* 통계 */}
          <div className="flex items-center gap-8 mb-4">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-instagram-text-primary">
                {stats.posts_count.toLocaleString()}
              </span>
              <span className="text-sm text-instagram-text-primary">게시물</span>
            </div>
            <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
              <span className="text-sm font-semibold text-instagram-text-primary">
                {stats.followers_count.toLocaleString()}
              </span>
              <span className="text-sm text-instagram-text-primary">팔로워</span>
            </button>
            <button className="flex items-center gap-1 hover:opacity-70 transition-opacity">
              <span className="text-sm font-semibold text-instagram-text-primary">
                {stats.following_count.toLocaleString()}
              </span>
              <span className="text-sm text-instagram-text-primary">팔로잉</span>
            </button>
          </div>

          {/* 사용자명 (모바일용, Desktop에서는 숨김) */}
          <div className="md:hidden">
            <h2 className="text-sm font-semibold text-instagram-text-primary">
              {user.name}
            </h2>
          </div>
        </div>
      </div>

      {/* Mobile: 세로 레이아웃 */}
      <div className="md:hidden px-4 py-4 space-y-4">
        {/* 상단: 프로필 이미지와 사용자명 */}
        <div className="flex items-center gap-4">
          {/* 프로필 이미지 */}
          <div className="flex-shrink-0">
            <div className="relative w-[90px] h-[90px] rounded-full overflow-hidden bg-gray-200">
              {/* 프로필 이미지 - 추후 사용자 프로필 이미지 추가 시 사용 */}
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
            </div>
          </div>

          {/* 통계 */}
          <div className="flex-1 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-base font-semibold text-instagram-text-primary">
                {stats.posts_count.toLocaleString()}
              </span>
              <span className="text-xs text-instagram-text-primary">게시물</span>
            </div>
            <button className="flex flex-col items-center hover:opacity-70 transition-opacity">
              <span className="text-base font-semibold text-instagram-text-primary">
                {stats.followers_count.toLocaleString()}
              </span>
              <span className="text-xs text-instagram-text-primary">팔로워</span>
            </button>
            <button className="flex flex-col items-center hover:opacity-70 transition-opacity">
              <span className="text-base font-semibold text-instagram-text-primary">
                {stats.following_count.toLocaleString()}
              </span>
              <span className="text-xs text-instagram-text-primary">팔로잉</span>
            </button>
          </div>
        </div>

        {/* 사용자명 및 버튼 */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-instagram-text-primary">
            {user.name}
          </h2>
          {isOwnProfile ? (
            <Button
              variant="outline"
              className="w-full px-4 py-1.5 text-sm font-semibold border-instagram-border hover:bg-gray-50"
              disabled
            >
              프로필 편집
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              className={`w-full px-4 py-1.5 text-sm font-semibold ${
                isFollowing
                  ? 'border-instagram-border hover:bg-gray-50 text-instagram-text-primary'
                  : 'bg-instagram-blue hover:bg-instagram-blue/90 text-white'
              }`}
              disabled
            >
              {isFollowing ? '팔로잉' : '팔로우'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

