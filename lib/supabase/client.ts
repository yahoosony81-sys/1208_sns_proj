import { createClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (인증 불필요한 공개 데이터용)
 *
 * Supabase 공식 Next.js 가이드에 맞춘 구현:
 * - anon key만 사용
 * - RLS 정책이 `to anon`인 데이터만 접근 가능
 * - 클라이언트 사이드에서 공개 데이터 조회용
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { supabase } from '@/lib/supabase/client';
 *
 * export default function PublicData() {
 *   const fetchData = async () => {
 *     const { data } = await supabase.from('public_table').select('*');
 *     return data;
 *   };
 * }
 * ```
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// 공식 가이드에서는 PUBLISHABLE_KEY를 사용하지만, ANON_KEY도 지원
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
