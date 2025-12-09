/**
 * @file PostGrid.tsx
 * @description 프로필 게시물 그리드 컴포넌트
 *
 * Instagram 스타일 게시물 그리드:
 * - 3열 그리드 레이아웃 (반응형)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 모달 열기
 *
 * @dependencies
 * - @/components/post/PostModal: 게시물 상세 모달
 * - @/lib/types: PostWithUser 타입
 * - next/image: 이미지 최적화
 * - lucide-react: 아이콘
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import PostModal from '@/components/post/PostModal';
import type { PostWithUser } from '@/lib/types';

interface PostGridProps {
  userId: string;
  posts: PostWithUser[];
}

export default function PostGrid({ userId, posts }: PostGridProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPostId(null);
  };

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full border-2 border-instagram-border flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-instagram-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-xl font-light text-instagram-text-primary mb-2">
          게시물 없음
        </p>
        <p className="text-sm text-instagram-text-secondary">
          아직 게시물이 없습니다.
        </p>
      </div>
    );
  }

  const selectedPost = selectedPostId
    ? posts.find((p) => p.id === selectedPostId)
    : null;

  return (
    <>
      {/* 그리드 레이아웃 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[2px] w-full">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 cursor-pointer group"
            onClick={() => handlePostClick(post.id)}
          >
            {/* 썸네일 이미지 */}
            <Image
              src={post.image_url}
              alt={post.caption || '게시물 이미지'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              draggable={false}
            />

            {/* Hover 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
              {/* 좋아요 수 */}
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="text-base font-semibold">
                  {post.likes_count.toLocaleString()}
                </span>
              </div>

              {/* 댓글 수 */}
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="text-base font-semibold">
                  {post.comments_count.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 게시물 상세 모달 */}
      {selectedPost && (
        <PostModal
          postId={selectedPost.id}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialPost={selectedPost}
          feedPosts={posts}
        />
      )}
    </>
  );
}

