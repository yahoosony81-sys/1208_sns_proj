/**
 * @file types.ts
 * @description Instagram Clone SNS 프로젝트의 TypeScript 타입 정의
 *
 * 이 파일은 Supabase 데이터베이스 스키마를 기반으로 한 타입 정의를 포함합니다.
 * PRD.md와 supabase/migrations/db.sql을 참고하여 작성되었습니다.
 *
 * @see {@link docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link supabase/migrations/db.sql} - 데이터베이스 스키마
 */

// ============================================
// 데이터베이스 테이블 타입
// ============================================

/**
 * Users 테이블 타입
 * Clerk 인증과 연동되는 사용자 정보
 */
export interface User {
  id: string; // UUID
  clerk_id: string; // Clerk User ID
  name: string;
  created_at: string; // ISO 8601 timestamp
}

/**
 * Posts 테이블 타입
 * 게시물 정보
 */
export interface Post {
  id: string; // UUID
  user_id: string; // UUID, users.id 참조
  image_url: string; // Supabase Storage URL
  caption: string | null; // 최대 2,200자
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Likes 테이블 타입
 * 게시물 좋아요 정보
 */
export interface Like {
  id: string; // UUID
  post_id: string; // UUID, posts.id 참조
  user_id: string; // UUID, users.id 참조
  created_at: string; // ISO 8601 timestamp
}

/**
 * Comments 테이블 타입
 * 댓글 정보
 */
export interface Comment {
  id: string; // UUID
  post_id: string; // UUID, posts.id 참조
  user_id: string; // UUID, users.id 참조
  content: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Follows 테이블 타입
 * 팔로우 관계 정보
 */
export interface Follow {
  id: string; // UUID
  follower_id: string; // UUID, users.id 참조 (팔로우하는 사람)
  following_id: string; // UUID, users.id 참조 (팔로우받는 사람)
  created_at: string; // ISO 8601 timestamp
}

// ============================================
// 데이터베이스 뷰 타입
// ============================================

/**
 * PostStats 뷰 타입
 * 게시물 통계 (좋아요 수, 댓글 수 포함)
 */
export interface PostStats {
  post_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

/**
 * UserStats 뷰 타입
 * 사용자 통계 (게시물 수, 팔로워 수, 팔로잉 수 포함)
 */
export interface UserStats {
  user_id: string;
  clerk_id: string;
  name: string;
  posts_count: number;
  followers_count: number;
  following_count: number;
}

// ============================================
// API 응답 타입
// ============================================

/**
 * 사용자 정보가 포함된 게시물 타입
 * API에서 게시물 조회 시 사용자 정보와 통계를 함께 반환
 */
export interface PostWithUser extends Post {
  user: User;
  likes_count: number;
  comments_count: number;
  is_liked: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부
}

/**
 * 사용자 정보가 포함된 댓글 타입
 * API에서 댓글 조회 시 사용자 정보를 함께 반환
 */
export interface CommentWithUser extends Comment {
  user: User;
}

// ============================================
// 폼 타입
// ============================================

/**
 * 게시물 작성 폼 타입
 */
export interface CreatePostForm {
  image: File;
  caption: string; // 최대 2,200자
}

/**
 * 댓글 작성 폼 타입
 */
export interface CreateCommentForm {
  content: string;
}

// ============================================
// 유틸리티 타입
// ============================================

/**
 * 페이지네이션 파라미터 타입
 */
export interface PaginationParams {
  limit?: number; // 기본값: 10
  offset?: number; // 기본값: 0
}

/**
 * API 에러 응답 타입
 */
export interface ApiError {
  message: string;
  code?: string;
}

