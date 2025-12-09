/**
 * @file ErrorBoundary.tsx
 * @description React Error Boundary 컴포넌트
 *
 * 예상치 못한 에러를 캐치하여 사용자 친화적인 UI를 표시합니다.
 * React 컴포넌트 트리에서 발생한 에러를 처리합니다.
 *
 * @dependencies
 * - react: Component, ErrorInfo
 * - @/lib/errors: 에러 로깅 유틸리티
 */

'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logError } from '@/lib/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logError(error, 'ErrorBoundary');
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-instagram-text-primary mb-2">
              문제가 발생했습니다
            </h2>
            <p className="text-instagram-text-secondary mb-6">
              예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-instagram-blue text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-instagram-border text-instagram-text-primary rounded-lg hover:bg-gray-50 transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-instagram-text-secondary hover:text-instagram-text-primary">
                  에러 상세 정보 (개발 모드)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

