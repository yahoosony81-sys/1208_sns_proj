/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 스켈레톤 UI
 *
 * PostCard와 동일한 레이아웃의 로딩 UI
 * Shimmer 효과 포함
 *
 * @dependencies
 * - tailwindcss: 스타일링
 */

export default function PostCardSkeleton() {
  return (
    <div className="bg-white border border-instagram-border rounded-lg mb-6 overflow-hidden">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between px-4 py-3 h-[60px] border-b border-instagram-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 이미지 스켈레톤 (1:1 정사각형) */}
      <div className="relative w-full aspect-square bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>

      {/* 액션 버튼 스켈레톤 */}
      <div className="flex items-center justify-between px-4 py-3 h-[48px]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="px-4 pb-4 space-y-2">
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-1">
          <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

