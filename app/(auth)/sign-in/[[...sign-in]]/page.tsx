/**
 * @file page.tsx
 * @description 로그인 페이지
 *
 * Clerk SignIn 컴포넌트를 사용한 로그인 페이지
 * 한국어 로컬라이제이션 적용
 *
 * @dependencies
 * - @clerk/nextjs: SignIn 컴포넌트
 */

import { SignIn } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-instagram-background">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-none border border-instagram-border',
            },
          }}
        />
      </div>
    </div>
  );
}

