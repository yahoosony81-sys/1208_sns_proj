/**
 * @file not-found.tsx
 * @description 커스텀 404 페이지
 *
 * 사용자를 찾을 수 없거나 페이지가 존재하지 않을 때 표시
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-instagram-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-instagram-text-primary mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-instagram-text-primary mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-instagram-text-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 사용자를 찾을 수 없습니다.
        </p>
        <Link href="/">
          <Button className="bg-instagram-blue hover:bg-instagram-blue/90 text-white">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}

