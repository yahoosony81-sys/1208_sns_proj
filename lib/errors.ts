/**
 * @file errors.ts
 * @description 공통 에러 처리 유틸리티
 *
 * 에러 타입 정의 및 사용자 친화적 에러 메시지 매핑:
 * - API 에러 타입 정의
 * - HTTP 상태 코드별 메시지 매핑
 * - Supabase 에러 타입별 메시지 제공
 * - 네트워크 에러 감지 및 처리
 *
 * @dependencies
 * - Next.js: NextResponse
 */

/**
 * API 에러 타입
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * 네트워크 에러 타입
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * 검증 에러 타입
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * HTTP 상태 코드별 사용자 친화적 에러 메시지
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다. 로그인해주세요.',
  403: '권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '이미 존재하는 데이터입니다.',
  413: '파일 크기가 너무 큽니다.',
  415: '지원하지 않는 파일 형식입니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  502: '서버에 연결할 수 없습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
  504: '요청 시간이 초과되었습니다.',
};

/**
 * Supabase 에러 코드별 메시지 매핑
 */
const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': '이미 존재하는 데이터입니다.',
  '23503': '관련된 데이터가 있어 삭제할 수 없습니다.',
  'PGRST116': '요청한 리소스를 찾을 수 없습니다.',
  'PGRST301': '인증이 필요합니다.',
  '42501': '권한이 없습니다.',
};

/**
 * HTTP 상태 코드에 따른 에러 메시지 반환
 */
export function getErrorMessage(statusCode: number, customMessage?: string): string {
  if (customMessage) {
    return customMessage;
  }
  return ERROR_MESSAGES[statusCode] || ERROR_MESSAGES[500];
}

/**
 * Supabase 에러를 사용자 친화적 메시지로 변환
 */
export function getSupabaseErrorMessage(error: any): string {
  if (!error) {
    return ERROR_MESSAGES[500];
  }

  // Supabase PostgREST 에러 코드 확인
  if (error.code && SUPABASE_ERROR_MESSAGES[error.code]) {
    return SUPABASE_ERROR_MESSAGES[error.code];
  }

  // Supabase 에러 메시지 확인
  if (error.message) {
    // 특정 패턴의 에러 메시지 처리
    if (error.message.includes('duplicate key')) {
      return '이미 존재하는 데이터입니다.';
    }
    if (error.message.includes('foreign key')) {
      return '관련된 데이터가 있어 처리할 수 없습니다.';
    }
    if (error.message.includes('not found')) {
      return '요청한 리소스를 찾을 수 없습니다.';
    }
    if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
      return '권한이 없습니다.';
    }
  }

  return error.message || ERROR_MESSAGES[500];
}

/**
 * 네트워크 에러인지 확인
 */
export function isNetworkError(error: any): boolean {
  if (error instanceof NetworkError) {
    return true;
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  if (error?.message?.includes('network') || error?.message?.includes('Network')) {
    return true;
  }
  return false;
}

/**
 * 에러 로깅 (개발 환경에서만 상세 로그)
 */
export function logError(error: any, context?: string): void {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    console.group(`[Error] ${context || 'Unknown'}`);
    console.error('Error:', error);
    if (error?.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();
  } else {
    // 프로덕션에서는 최소한의 로그만
    console.error(`[Error] ${context || 'Unknown'}:`, error?.message || error);
  }
}

/**
 * API 응답에서 에러 추출
 */
export async function extractApiError(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      message: data.error || getErrorMessage(response.status),
      code: data.code,
      statusCode: response.status,
    };
  } catch {
    return {
      message: getErrorMessage(response.status),
      statusCode: response.status,
    };
  }
}

