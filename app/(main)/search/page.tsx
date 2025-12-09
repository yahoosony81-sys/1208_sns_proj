/**
 * @file page.tsx
 * @description 검색 페이지
 *
 * Instagram 스타일 검색 페이지:
 * - 검색 입력 필드
 * - 검색 결과 표시 (사용자, 게시물)
 * - 탭 필터 (전체/사용자/게시물)
 * - 로딩 상태 및 빈 상태 처리
 *
 * @dependencies
 * - @/components/search/SearchInput: 검색 입력 컴포넌트
 * - @/components/search/SearchResults: 검색 결과 컴포넌트
 * - @/lib/types: User, PostWithUser 타입
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchInput from '@/components/search/SearchInput';
import SearchResults from '@/components/search/SearchResults';
import type { User, PostWithUser } from '@/lib/types';
import { apiGet } from '@/lib/api-client';

type SearchType = 'all' | 'users' | 'posts';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState<SearchType>(
    (searchParams.get('type') as SearchType) || 'all'
  );
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 실행
  const performSearch = useCallback(
    async (query: string, type: SearchType) => {
      if (!query || query.length < 2) {
        setUsers([]);
        setPosts([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          type,
          limit: '20',
        });

        const result = await apiGet<{
          users: User[];
          posts: PostWithUser[];
          query: string;
          type: string;
        }>(`/api/search?${params.toString()}`);

        if (!result.success || result.error) {
          throw new Error(result.error?.message || '검색에 실패했습니다.');
        }

        setUsers(result.data?.users || []);
        setPosts(result.data?.posts || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '검색에 실패했습니다.';
        setError(errorMessage);
        setUsers([]);
        setPosts([]);
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // URL 파라미터와 동기화
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const type = (searchParams.get('type') as SearchType) || 'all';

    setSearchQuery(query);
    setSearchType(type);
    performSearch(query, type);
  }, [searchParams, performSearch]);

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const params = new URLSearchParams();
      if (value) {
        params.set('q', value);
      }
      if (searchType !== 'all') {
        params.set('type', searchType);
      }
      router.push(`/search?${params.toString()}`);
    },
    [searchType, router]
  );

  // 검색 타입 변경 핸들러
  const handleTypeChange = useCallback(
    (type: SearchType) => {
      setSearchType(type);
      const params = new URLSearchParams();
      if (searchQuery) {
        params.set('q', searchQuery);
      }
      if (type !== 'all') {
        params.set('type', type);
      }
      router.push(`/search?${params.toString()}`);
    },
    [searchQuery, router]
  );

  return (
    <div className="w-full max-w-[630px] mx-auto">
      <div className="space-y-6">
        {/* 검색 입력 */}
        <div className="sticky top-0 z-10 bg-white py-4 -mx-4 px-4 border-b border-instagram-border">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="검색"
          />
        </div>

        {/* 검색 타입 탭 */}
        {searchQuery && (
          <div className="flex items-center gap-4 border-b border-instagram-border">
            <button
              onClick={() => handleTypeChange('all')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                searchType === 'all'
                  ? 'border-instagram-text-primary text-instagram-text-primary'
                  : 'border-transparent text-instagram-text-secondary hover:text-instagram-text-primary'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => handleTypeChange('users')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                searchType === 'users'
                  ? 'border-instagram-text-primary text-instagram-text-primary'
                  : 'border-transparent text-instagram-text-secondary hover:text-instagram-text-primary'
              }`}
            >
              사용자
            </button>
            <button
              onClick={() => handleTypeChange('posts')}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                searchType === 'posts'
                  ? 'border-instagram-text-primary text-instagram-text-primary'
                  : 'border-transparent text-instagram-text-secondary hover:text-instagram-text-primary'
              }`}
            >
              게시물
            </button>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* 검색 결과 */}
        <SearchResults
          users={searchType === 'all' || searchType === 'users' ? users : []}
          posts={searchType === 'all' || searchType === 'posts' ? posts : []}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
}

