/**
 * @file SearchResults.tsx
 * @description 검색 결과 컴포넌트
 *
 * Instagram 스타일 검색 결과:
 * - 사용자 검색 결과 리스트 (프로필 이미지, 이름, 프로필 링크)
 * - 게시물 검색 결과 리스트 (썸네일, 캡션 미리보기)
 * - 빈 결과 상태 처리
 *
 * @dependencies
 * - @/lib/types: User, PostWithUser 타입
 * - next/image: 이미지 최적화
 * - next/link: 네비게이션
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PostModal from '@/components/post/PostModal';
import type { User, PostWithUser } from '@/lib/types';

interface SearchResultsProps {
  users?: User[];
  posts?: PostWithUser[];
  isLoading?: boolean;
  searchQuery?: string;
}

export default function SearchResults({
  users = [],
  posts = [],
  isLoading = false,
  searchQuery = '',
}: SearchResultsProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = posts.find((p) => p.id === selectedPostId);
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-instagram-text-secondary text-sm">
          검색어를 입력하세요
        </p>
      </div>
    );
  }

  if (users.length === 0 && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-instagram-text-secondary text-sm">
          &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 사용자 검색 결과 */}
      {users.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-instagram-text-primary mb-3">
            사용자
          </h2>
          <div className="space-y-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {user.profile_image_url ? (
                    <Image
                      src={user.profile_image_url}
                      alt={`${user.name}의 프로필 이미지`}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-instagram-text-primary truncate">
                    {user.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 게시물 검색 결과 */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-instagram-text-primary mb-3">
            게시물
          </h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPostId(post.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={post.image_url}
                    alt={post.caption || '게시물 이미지'}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {post.user.profile_image_url ? (
                        <Image
                          src={post.user.profile_image_url}
                          alt={`${post.user.name}의 프로필 이미지`}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-instagram-text-primary truncate">
                      {post.user.name}
                    </p>
                  </div>
                  {post.caption && (
                    <p className="text-sm text-instagram-text-secondary line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 게시물 상세 모달 */}
      {selectedPost && (
        <PostModal
          postId={selectedPost.id}
          open={!!selectedPostId}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPostId(null);
            }
          }}
          initialPost={selectedPost}
          feedPosts={posts}
        />
      )}
    </div>
  );
}

