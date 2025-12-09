/**
 * @file page.tsx
 * @description 본인 프로필 리다이렉트 페이지
 *
 * `/profile`로 접근 시 현재 사용자의 프로필로 리다이렉트
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - @/lib/supabase/server: Supabase 서버 클라이언트
 */

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ProfileRedirectPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    redirect('/sign-in');
  }

  // Clerk user ID로 users 테이블에서 사용자 찾기
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkUserId)
    .single();

  if (error || !user) {
    // 사용자를 찾을 수 없는 경우 홈으로 리다이렉트
    console.error('Error finding user:', error);
    redirect('/');
  }

  // 본인 프로필로 리다이렉트
  redirect(`/profile/${user.id}`);
}

