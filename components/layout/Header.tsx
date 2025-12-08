/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * Mobile (< 768px) 전용:
 * - 높이: 60px
 * - 로고 + 알림/DM/프로필 아이콘
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 네비게이션
 * - @clerk/nextjs: 사용자 인증
 */

'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { Heart, Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-instagram-border z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold text-instagram-text-primary">
          Instagram
        </Link>

        {/* 우측 아이콘들 */}
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <>
              <Link
                href="/activity"
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="활동"
              >
                <Heart className="w-6 h-6 text-instagram-text-primary" />
              </Link>
              <Link
                href="/direct"
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="메시지"
              >
                <Send className="w-6 h-6 text-instagram-text-primary" />
              </Link>
            </>
          )}
          <Link
            href={isSignedIn ? '/profile' : '/sign-in'}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="프로필"
          >
            <User className="w-6 h-6 text-instagram-text-primary" />
          </Link>
        </div>
      </div>
    </header>
  );
}

