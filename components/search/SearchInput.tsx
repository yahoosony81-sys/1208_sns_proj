/**
 * @file SearchInput.tsx
 * @description 검색 입력 컴포넌트
 *
 * Instagram 스타일 검색 입력:
 * - 검색어 입력 필드
 * - 실시간 검색 (debounce 적용)
 * - 검색어 초기화 버튼
 *
 * @dependencies
 * - @/components/ui/input: Input 컴포넌트
 * - lucide-react: 아이콘
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '검색',
  debounceMs = 300,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce된 onChange 호출
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, onChange, debounceMs]);

  // 외부 value 변경 시 동기화
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onChange('');
  }, [onChange]);

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-5 h-5 text-instagram-text-secondary" />
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 h-10 text-sm bg-gray-50 border-instagram-border focus:bg-white"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
          aria-label="검색어 지우기"
        >
          <X className="w-4 h-4 text-instagram-text-secondary" />
        </button>
      )}
    </div>
  );
}

