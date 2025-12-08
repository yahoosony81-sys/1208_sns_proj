/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 반응형 레이아웃:
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px ~ 1023px): 72px 너비, 아이콘만
 * - Mobile (< 768px): 숨김
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
import { Home, Search, PlusSquare, User } from 'lucide-react';
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
  { href: '/create', icon: PlusSquare, label: '만들기' },
  { href: '/profile', icon: User, label: '프로필', requiresAuth: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-instagram-border z-40">
      {/* Desktop: 244px 너비, 아이콘 + 텍스트 */}
      <div className="hidden lg:flex flex-col w-[244px] px-4 py-6">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-instagram-text-primary">
            Instagram
          </Link>
        </div>
        <nav className="flex flex-col gap-1">
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
                  'flex items-center gap-4 px-3 py-3 rounded-lg transition-colors',
                  'hover:bg-gray-50',
                  isActive
                    ? 'font-semibold text-instagram-text-primary'
                    : 'font-normal text-instagram-text-primary'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6',
                    isActive ? 'stroke-[2.5]' : 'stroke-[2]'
                  )}
                />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="hidden md:flex lg:hidden flex-col w-[72px] items-center py-6">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-instagram-text-primary">
            IG
          </Link>
        </div>
        <nav className="flex flex-col gap-1 w-full items-center">
          {navItems.map((item) => {
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
                  'flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
                  'hover:bg-gray-50',
                  isActive && 'bg-gray-50'
                )}
                title={item.label}
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
        </nav>
      </div>
    </aside>
  );
}

