/**
 * @file api-client.ts
 * @description API 클라이언트 유틸리티
 *
 * fetch 래퍼 함수 및 네트워크 에러 처리:
 * - 네트워크 에러 자동 감지 및 처리
 * - 타임아웃 처리
 * - 재시도 로직 (선택적)
 * - 에러 메시지 변환
 *
 * @dependencies
 * - @/lib/errors: 에러 처리 유틸리티
 */

import { NetworkError, extractApiError, isNetworkError, logError, type ApiError } from './errors';

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions extends RequestInit {
  timeout?: number; // 타임아웃 (밀리초, 기본값: 30000)
  retries?: number; // 재시도 횟수 (기본값: 0)
  retryDelay?: number; // 재시도 지연 시간 (밀리초, 기본값: 1000)
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * 타임아웃을 포함한 fetch 래퍼
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new NetworkError('요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.');
    }
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 fetch
 */
async function fetchWithRetry(
  url: string,
  options: ApiRequestOptions = {},
  retries: number = 0,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const timeout = options.timeout || 30000;
      const response = await fetchWithTimeout(url, options, timeout);

      // 성공적인 응답이거나 재시도할 수 없는 에러인 경우
      if (response.ok || response.status < 500 || attempt === retries) {
        return response;
      }

      // 5xx 에러인 경우 재시도
      if (response.status >= 500 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      return response;
    } catch (error: any) {
      lastError = error;

      // 네트워크 에러이고 재시도 가능한 경우
      if (isNetworkError(error) && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      // 마지막 시도이거나 재시도할 수 없는 에러인 경우
      if (attempt === retries) {
        throw error;
      }
    }
  }

  throw lastError || new NetworkError('요청에 실패했습니다.');
}

/**
 * API 요청 함수
 *
 * @param url - 요청 URL
 * @param options - fetch 옵션 및 커스텀 옵션 (timeout, retries, retryDelay)
 * @returns API 응답 데이터 또는 에러
 */
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { timeout, retries = 0, retryDelay = 1000, ...fetchOptions } = options;

  try {
    const response = await fetchWithRetry(url, { ...fetchOptions, timeout, retries, retryDelay }, retries, retryDelay);

    if (!response.ok) {
      const error = await extractApiError(response);
      logError(error, `API Request Failed: ${url}`);
      return {
        success: false,
        error,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error: any) {
    logError(error, `API Request Error: ${url}`);

    // 네트워크 에러 처리
    if (isNetworkError(error)) {
      return {
        success: false,
        error: {
          message: error.message || '네트워크 연결을 확인해주세요.',
          code: 'NETWORK_ERROR',
        },
      };
    }

    // 기타 에러
    return {
      success: false,
      error: {
        message: error?.message || '요청 처리 중 오류가 발생했습니다.',
        code: 'UNKNOWN_ERROR',
      },
    };
  }
}

/**
 * GET 요청 헬퍼
 */
export async function apiGet<T = any>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

/**
 * POST 요청 헬퍼
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 요청 헬퍼
 */
export async function apiDelete<T = any>(
  url: string,
  body?: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// Re-export error utilities for convenience
export { isNetworkError, NetworkError, type ApiError } from './errors';

