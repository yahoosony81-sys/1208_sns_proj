/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * Instagram 스타일 홈 피드:
 * - 배경색: #FAFAFA
 * - 게시물 카드 목록 표시 (추후 PostFeed 컴포넌트 통합)
 *
 * @dependencies
 * - components/post/PostFeed: 게시물 피드 컴포넌트 (추후 생성)
 */

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="w-full">
      {/* 추후 PostFeed 컴포넌트 통합 */}
      <div className="text-center py-12 text-instagram-text-secondary">
        <p>게시물이 없습니다.</p>
        <p className="text-sm mt-2">첫 게시물을 작성해보세요!</p>
      </div>
    </div>
  );
}

