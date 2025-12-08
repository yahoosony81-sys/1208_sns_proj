/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Mobile (< 768px) 전용:
 * - 높이: 50px
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 네비게이션
 * - @clerk/nextjs: 사용자 인증
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/create', icon: PlusSquare, label: '만들기', requiresAuth: true },
  { href: '/activity', icon: Heart, label: '좋아요', requiresAuth: true },
  { href: '/profile', icon: User, label: '프로필', requiresAuth: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-instagram-border z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          // 인증이 필요한 메뉴는 로그인 상태 확인
          if (item.requiresAuth && !isSignedIn) {
            return null;
          }

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-center flex-1 h-full transition-colors',
                'hover:bg-gray-50',
                isActive && 'text-instagram-text-primary'
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  'w-6 h-6',
                  isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

