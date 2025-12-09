/**
 * @file route.ts
 * @description 사용자 정보 조회 API 라우트
 *
 * GET /api/users/[userId]: 사용자 정보 조회
 * - user_stats 뷰 활용하여 통계 조회
 * - 현재 사용자와의 팔로우 관계 확인
 * - 본인 프로필인지 확인
 *
 * @dependencies
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 * - @clerk/nextjs/server: Clerk 인증
 * - @/lib/types: TypeScript 타입
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';
import { getErrorMessage, getSupabaseErrorMessage, logError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/[userId]
 * 사용자 정보 조회
 *
 * Path Parameters:
 * - userId: 사용자 ID (UUID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // user_stats 뷰에서 사용자 정보 및 통계 조회
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (statsError || !userStats) {
      logError(statsError, 'GET /api/users/[userId] - Fetch user stats');
      const errorMessage = statsError ? getSupabaseErrorMessage(statsError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // users 테이블에서 추가 정보 조회 (created_at 등)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, name, profile_image_url, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logError(userError, 'GET /api/users/[userId] - Fetch user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 현재 사용자 정보 조회 (본인 프로필 확인 및 팔로우 관계 확인용)
    const { userId: clerkUserId } = await auth();
    let isOwnProfile = false;
    let isFollowing = false;

    if (clerkUserId) {
      // 본인 프로필인지 확인
      isOwnProfile = user.clerk_id === clerkUserId;

      // 다른 사람 프로필인 경우 팔로우 관계 확인
      if (!isOwnProfile) {
        // Clerk user ID로 현재 사용자의 users 테이블 ID 찾기
        const { data: currentUser } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', clerkUserId)
          .single();

        if (currentUser) {
          // follows 테이블에서 팔로우 관계 확인
          const { data: follow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('following_id', userId)
            .single();

          isFollowing = !!follow;
        }
      }
    }

    // 응답 데이터 구성
    const response = {
      user: {
        id: user.id,
        clerk_id: user.clerk_id,
        name: user.name,
        profile_image_url: user.profile_image_url,
        created_at: user.created_at,
        posts_count: userStats.posts_count || 0,
        followers_count: userStats.followers_count || 0,
        following_count: userStats.following_count || 0,
        is_following: isFollowing,
        is_own_profile: isOwnProfile,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logError(error, 'GET /api/users/[userId]');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[userId]
 * 사용자 정보 업데이트
 *
 * Path Parameters:
 * - userId: 사용자 ID (UUID)
 *
 * Request Body:
 * - name: 사용자 이름 (선택사항, 최대 30자)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: getErrorMessage(400, '사용자 ID가 필요합니다.') },
        { status: 400 }
      );
    }

    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(401) },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      logError(userError, 'PUT /api/users/[userId] - Fetch user');
      const errorMessage = userError ? getSupabaseErrorMessage(userError) : '사용자를 찾을 수 없습니다.';
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    // 본인 프로필인지 확인
    if (user.clerk_id !== clerkUserId) {
      return NextResponse.json(
        { error: getErrorMessage(403, '본인의 프로필만 수정할 수 있습니다.') },
        { status: 403 }
      );
    }

    // FormData 파싱 (이미지 업로드 지원)
    const contentType = request.headers.get('content-type') || '';
    let name: string | undefined;
    let profileImage: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name') as string | undefined;
      profileImage = formData.get('profileImage') as File | null;
    } else {
      // JSON 요청 처리 (기존 호환성)
      const body = await request.json();
      name = body.name;
    }

    // 업데이트할 데이터 준비
    const updateData: { name?: string; profile_image_url?: string } = {};

    // 이름 유효성 검사 및 업데이트
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름은 문자열이어야 합니다.') },
          { status: 400 }
        );
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름을 입력해주세요.') },
          { status: 400 }
        );
      }

      if (trimmedName.length > 30) {
        return NextResponse.json(
          { error: getErrorMessage(400, '이름은 30자 이하여야 합니다.') },
          { status: 400 }
        );
      }

      updateData.name = trimmedName;
    }

    // 프로필 이미지 업로드 처리
    if (profileImage) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
      const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'posts';

      // 파일 크기 검증
      if (profileImage.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: getErrorMessage(413, '파일 크기는 5MB 이하여야 합니다.') },
          { status: 413 }
        );
      }

      // MIME 타입 검증
      if (!ALLOWED_MIME_TYPES.includes(profileImage.type)) {
        return NextResponse.json(
          { error: getErrorMessage(415, 'JPEG, PNG, WebP 파일만 업로드 가능합니다.') },
          { status: 415 }
        );
      }

      // 기존 프로필 이미지 삭제 (있는 경우)
      const { data: currentUser } = await supabase
        .from('users')
        .select('profile_image_url')
        .eq('id', userId)
        .single();

      if (currentUser?.profile_image_url) {
        // 기존 이미지 경로 추출 (URL에서 경로만 추출)
        try {
          const oldImageUrl = currentUser.profile_image_url;
          const urlParts = oldImageUrl.split('/storage/v1/object/public/');
          if (urlParts.length > 1) {
            const pathParts = urlParts[1].split('/');
            if (pathParts.length >= 2) {
              const oldFilePath = `${pathParts[0]}/${pathParts.slice(1).join('/')}`;
              await supabase.storage.from(STORAGE_BUCKET).remove([oldFilePath]);
            }
          }
        } catch (err) {
          // 기존 이미지 삭제 실패는 무시 (로그만 남김)
          logError(err, 'PUT /api/users/[userId] - Delete old profile image');
        }
      }

      // 파일 확장자 추출
      const fileExt = profileImage.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `profile-${timestamp}-${randomString}.${fileExt}`;
      const filePath = `${clerkUserId}/profile/${fileName}`;

      // Supabase Storage에 이미지 업로드
      const fileBuffer = await profileImage.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType: profileImage.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        logError(uploadError, 'PUT /api/users/[userId] - Upload profile image');
        const errorMessage = getSupabaseErrorMessage(uploadError);
        return NextResponse.json(
          { error: errorMessage || '프로필 이미지 업로드에 실패했습니다.' },
          { status: 500 }
        );
      }

      // 공개 URL 생성
      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
      updateData.profile_image_url = publicUrl;
    }

    // 업데이트할 필드가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: getErrorMessage(400, '업데이트할 정보가 없습니다.') },
        { status: 400 }
      );
    }

    // 사용자 정보 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, clerk_id, name, profile_image_url, created_at')
      .single();

    if (updateError) {
      logError(updateError, 'PUT /api/users/[userId] - Update user');
      const errorMessage = getSupabaseErrorMessage(updateError);
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: updatedUser,
      message: '프로필이 성공적으로 업데이트되었습니다.',
    });
  } catch (error) {
    logError(error, 'PUT /api/users/[userId]');
    return NextResponse.json(
      { error: getErrorMessage(500) },
      { status: 500 }
    );
  }
}

