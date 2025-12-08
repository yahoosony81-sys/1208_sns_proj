import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

/**
 * Supabase 공식 Next.js 퀵스타트 가이드 예제
 * 
 * 이 페이지는 Supabase 공식 문서의 예제를 기반으로 합니다:
 * https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
 * 
 * 사용 방법:
 * 1. Supabase Dashboard에서 `instruments` 테이블 생성
 * 2. 샘플 데이터 삽입
 * 3. RLS 정책 설정 (공개 읽기 허용)
 */
async function InstrumentsData() {
  const supabase = await createClient();
  const { data: instruments, error } = await supabase
    .from("instruments")
    .select();

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">Error loading instruments</p>
        <p className="text-red-600 text-sm mt-1">{error.message}</p>
        <p className="text-red-500 text-xs mt-2">
          Make sure you have created the `instruments` table in Supabase.
        </p>
      </div>
    );
  }

  if (!instruments || instruments.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800 font-semibold">No instruments found</p>
        <p className="text-yellow-600 text-sm mt-1">
          Add some data to the `instruments` table in Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Instruments</h2>
      <ul className="space-y-2">
        {instruments.map((instrument: any) => (
          <li
            key={instrument.id}
            className="p-3 bg-white border border-gray-200 rounded shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{instrument.name}</span>
              <span className="text-sm text-gray-500">ID: {instrument.id}</span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm text-gray-600">
          <strong>Raw JSON:</strong>
        </p>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(instruments, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default function Instruments() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Quickstart Example</h1>
      <p className="text-gray-600 mb-6">
        This page demonstrates fetching data from Supabase following the{" "}
        <a
          href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          official Supabase Next.js guide
        </a>
        .
      </p>
      <Suspense fallback={<div className="p-4">Loading instruments...</div>}>
        <InstrumentsData />
      </Suspense>
    </div>
  );
}

