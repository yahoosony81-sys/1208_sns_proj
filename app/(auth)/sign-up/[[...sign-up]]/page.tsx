/**
 * @file page.tsx
 * @description 회원가입 페이지
 *
 * Clerk SignUp 컴포넌트를 사용한 회원가입 페이지
 * 한국어 로컬라이제이션 적용
 *
 * @dependencies
 * - @clerk/nextjs: SignUp 컴포넌트
 */

import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-instagram-background">
      <div className="w-full max-w-md">
        <SignUp
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

