/**
 * @file layout.tsx
 * @description 메인 레이아웃 컴포넌트
 *
 * Instagram 스타일 레이아웃:
 * - Desktop: Sidebar (244px) + Main Content (최대 630px, 중앙 정렬)
 * - Tablet: Sidebar (72px) + Main Content (전체 너비)
 * - Mobile: Header (60px) + Main Content + BottomNav (50px)
 *
 * @dependencies
 * - components/layout/Sidebar: 사이드바
 * - components/layout/Header: 모바일 헤더
 * - components/layout/BottomNav: 모바일 하단 네비게이션
 */

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Desktop/Tablet: Sidebar */}
      <Sidebar />

      {/* Mobile: Header */}
      <Header />

      {/* Main Content */}
      <main
        className={`
          min-h-screen
          bg-instagram-background
          pt-[60px] md:pt-0
          pb-[50px] md:pb-0
          lg:pl-[244px]
          md:pl-[72px]
        `}
      >
        <div className="max-w-[630px] mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Mobile: Bottom Navigation */}
      <BottomNav />
    </>
  );
}

