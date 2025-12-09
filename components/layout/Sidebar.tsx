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

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Home, Search, PlusSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreatePostModal from '@/components/post/CreatePostModal';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/profile', icon: User, label: '프로필', requiresAuth: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                  'hover:bg-yellow-50',
                  isActive
                    ? 'font-semibold text-yellow-500'
                    : 'font-normal text-instagram-text-primary'
                )}
                aria-current={isActive ? 'page' : undefined}
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
          {/* 만들기 버튼 */}
          <button
            onClick={() => {
              if (!isSignedIn) {
                router.push('/sign-in');
                return;
              }
              setIsCreateModalOpen(true);
            }}
            className={cn(
              'flex items-center gap-4 px-3 py-3 rounded-lg transition-colors',
              'hover:bg-yellow-50',
              'font-normal text-instagram-text-primary',
              'w-full text-left'
            )}
          >
            <PlusSquare className="w-6 h-6" />
            <span className="text-base">만들기</span>
          </button>
          {/* 로그인하지 않은 사용자를 위한 로그인 링크 */}
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className={cn(
                'flex items-center gap-4 px-3 py-3 rounded-lg transition-colors',
                'hover:bg-yellow-50',
                'font-normal text-instagram-text-primary',
                pathname === '/sign-in' && 'font-semibold text-yellow-500'
              )}
            >
              <User className="w-6 h-6" />
              <span className="text-base">로그인</span>
            </Link>
          )}
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
                  'hover:bg-yellow-50',
                  isActive && 'bg-yellow-50'
                )}
                title={item.label}
                aria-current={isActive ? 'page' : undefined}
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
          {/* 만들기 버튼 (Tablet) */}
          <button
            onClick={() => {
              if (!isSignedIn) {
                router.push('/sign-in');
                return;
              }
              setIsCreateModalOpen(true);
            }}
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
              'hover:bg-yellow-50'
            )}
            title="만들기"
          >
            <PlusSquare className="w-6 h-6" />
          </button>
          {/* 로그인하지 않은 사용자를 위한 로그인 링크 */}
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
                'hover:bg-yellow-50',
                pathname === '/sign-in' && 'bg-yellow-50'
              )}
              title="로그인"
            >
              <User className="w-6 h-6" />
            </Link>
          )}
        </nav>
      </div>

      {/* 게시물 작성 모달 */}
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => {
          // 업로드 성공 시 피드 새로고침을 위해 페이지 새로고침
          // 추후 PostFeed 컴포넌트에서 직접 새로고침하도록 개선 가능
          if (pathname === '/') {
            window.location.reload();
          } else {
            router.push('/');
          }
        }}
      />
    </aside>
  );
}

