/**
 * @file CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일 게시물 작성 모달:
 * - 이미지 선택 및 미리보기 (1:1 정사각형)
 * - 캡션 입력 (최대 2,200자)
 * - 파일 검증 (최대 5MB, JPEG/PNG/WebP)
 * - Supabase Storage 업로드
 *
 * @dependencies
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/textarea: Textarea 컴포넌트
 * - @clerk/nextjs: useUser 훅
 * - lucide-react: 아이콘
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { isNetworkError } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CAPTION_LENGTH = 2200;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const { user, isSignedIn } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);

      // 파일 크기 검증
      if (file.size > MAX_FILE_SIZE) {
        setError('파일 크기는 5MB 이하여야 합니다.');
        return;
      }

      // MIME 타입 검증
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        setError('JPEG, PNG, WebP 파일만 업로드 가능합니다.');
        return;
      }

      // 파일 확장자 검증
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        setError('JPEG, PNG, WebP 파일만 업로드 가능합니다.');
        return;
      }

      setSelectedFile(file);

      // 미리보기 URL 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  // 파일 제거 핸들러
  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  }, []);

  // 캡션 변경 핸들러
  const handleCaptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (value.length <= MAX_CAPTION_LENGTH) {
        setCaption(value);
        setError(null);
      }
    },
    []
  );

  // 게시물 업로드 핸들러
  const handleSubmit = useCallback(async () => {
    if (!isSignedIn || !user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!selectedFile) {
      setError('이미지를 선택해주세요.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || '게시물 업로드에 실패했습니다.';
        throw new Error(errorMessage);
      }

      // 성공 시 모달 닫기 및 상태 초기화
      handleFileRemove();
      setCaption('');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = isNetworkError(err)
        ? '네트워크 연결을 확인해주세요.'
        : err instanceof Error
          ? err.message
          : '게시물 업로드에 실패했습니다.';
      setError(errorMessage);
      console.error('Error uploading post:', err);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, caption, isSignedIn, user, onOpenChange, onSuccess, handleFileRemove]);

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    if (isUploading) return;
    onOpenChange(false);
  }, [isUploading, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 py-4 border-b border-instagram-border">
          <DialogTitle className="text-lg font-semibold text-instagram-text-primary">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-instagram-border rounded-lg bg-gray-50">
              <ImageIcon className="w-16 h-16 text-instagram-text-secondary mb-4" />
              <p className="text-lg font-semibold text-instagram-text-primary mb-2">
                사진을 선택하세요
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-instagram-blue hover:bg-instagram-blue/90 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                컴퓨터에서 선택
              </Button>
              <p className="text-xs text-instagram-text-secondary mt-2">
                JPEG, PNG, WebP (최대 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <button
                  onClick={handleFileRemove}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="이미지 제거"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* 캡션 입력 */}
              <div className="space-y-2">
                <Textarea
                  placeholder="캡션을 입력하세요..."
                  value={caption}
                  onChange={handleCaptionChange}
                  className="min-h-[120px] resize-none"
                  maxLength={MAX_CAPTION_LENGTH}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      'text-xs',
                      caption.length > MAX_CAPTION_LENGTH * 0.9
                        ? 'text-red-500'
                        : 'text-instagram-text-secondary'
                    )}
                  >
                    {caption.length}/{MAX_CAPTION_LENGTH}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 업로드 버튼 */}
          {previewUrl && (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUploading || !selectedFile}
                className="bg-instagram-blue hover:bg-instagram-blue/90 text-white"
              >
                {isUploading ? '업로드 중...' : '게시'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

