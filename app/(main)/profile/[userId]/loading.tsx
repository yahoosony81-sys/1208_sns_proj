/**
 * @file loading.tsx
 * @description 프로필 페이지 로딩 상태
 *
 * 프로필 페이지 로딩 중 표시되는 Skeleton UI
 */

export default function ProfileLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* 프로필 헤더 스켈레톤 */}
      <div className="hidden md:flex items-start gap-8 px-4 py-8">
        {/* 프로필 이미지 스켈레톤 */}
        <div className="flex-shrink-0">
          <div className="w-[150px] h-[150px] rounded-full bg-gray-200" />
        </div>

        {/* 정보 영역 스켈레톤 */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-32 h-8 bg-gray-200 rounded" />
            <div className="w-24 h-8 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-8">
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Mobile 프로필 헤더 스켈레톤 */}
      <div className="md:hidden px-4 py-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-[90px] h-[90px] rounded-full bg-gray-200" />
          <div className="flex-1 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-3 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-3 bg-gray-200 rounded" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-4 bg-gray-200 rounded" />
              <div className="w-12 h-3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-full h-8 bg-gray-200 rounded" />
        </div>
      </div>

      {/* 구분선 */}
      <div className="border-t border-instagram-border my-4" />

      {/* 게시물 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px]">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

