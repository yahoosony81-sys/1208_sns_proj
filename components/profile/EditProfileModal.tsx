/**
 * @file EditProfileModal.tsx
 * @description 프로필 편집 모달 컴포넌트
 *
 * Instagram 스타일 프로필 편집 모달:
 * - 사용자 이름 수정
 * - 프로필 이미지 업로드 (추후 구현)
 * - 폼 유효성 검사
 * - Supabase 업데이트
 *
 * @dependencies
 * - @/components/ui/dialog: Dialog 컴포넌트
 * - @/components/ui/button: Button 컴포넌트
 * - @/components/ui/input: Input 컴포넌트
 * - @/components/ui/label: Label 컴포넌트
 * - @clerk/nextjs: useUser 훅
 * - react-hook-form: 폼 관리
 * - zod: 유효성 검사
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isNetworkError } from '@/lib/api-client';
import type { User } from '@/lib/types';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
}

const MAX_NAME_LENGTH = 30;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EditProfileModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditProfileModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user.profile_image_url || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 초기값 설정
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (newOpen) {
        setName(user.name);
        setProfileImage(null);
        setProfileImagePreview(user.profile_image_url || null);
        setError(null);
      }
      onOpenChange(newOpen);
    },
    [user.name, user.profile_image_url, onOpenChange]
  );

  // 이미지 선택 핸들러
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('JPEG, PNG, WebP 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    // 파일 크기 검증
    if (file.size > MAX_IMAGE_SIZE) {
      setError('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }

    setProfileImage(file);
    setError(null);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 이미지 제거 핸들러
  const handleImageRemove = useCallback(() => {
    setProfileImage(null);
    setProfileImagePreview(user.profile_image_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [user.profile_image_url]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 유효성 검사
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError('이름을 입력해주세요.');
        return;
      }

      if (trimmedName.length > MAX_NAME_LENGTH) {
        setError(`이름은 ${MAX_NAME_LENGTH}자 이하여야 합니다.`);
        return;
      }

      // 변경사항이 없으면 모달만 닫기
      if (trimmedName === user.name && !profileImage) {
        onOpenChange(false);
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        // FormData 생성 (이미지가 있는 경우)
        const formData = new FormData();
        formData.append('name', trimmedName);
        if (profileImage) {
          formData.append('profileImage', profileImage);
        }

        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '프로필 업데이트에 실패했습니다.');
        }

        // 성공 시 페이지 새로고침하여 변경사항 반영
        router.refresh();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        const errorMessage = isNetworkError(err)
          ? '네트워크 오류가 발생했습니다. 연결을 확인해주세요.'
          : err instanceof Error
            ? err.message
            : '프로필 업데이트에 실패했습니다.';
        setError(errorMessage);
        console.error('Error updating profile:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, user.name, user.id, profileImage, onOpenChange, router, onSuccess]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-instagram-text-primary">
            프로필 편집
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-instagram-text-primary">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              maxLength={MAX_NAME_LENGTH}
              disabled={isSubmitting}
              className="text-sm"
              placeholder="이름을 입력하세요"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-instagram-text-secondary">
                {name.length}/{MAX_NAME_LENGTH}
              </p>
              {error && (
                <p className="text-xs text-red-500" role="alert" aria-live="polite">
                  {error}
                </p>
              )}
            </div>
          </div>

          {/* 프로필 이미지 */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-instagram-text-primary">
              프로필 사진
            </Label>
            <div className="flex items-center gap-4">
              {/* 프로필 이미지 미리보기 */}
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview}
                    alt="프로필 미리보기"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                )}
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-0 right-0 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                    aria-label="이미지 제거"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>

              {/* 이미지 업로드 버튼 */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                  className="hidden"
                  id="profile-image-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="w-full text-sm font-semibold border-instagram-border hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {profileImage ? '사진 변경' : '사진 업로드'}
                </Button>
                <p className="text-xs text-instagram-text-secondary">
                  JPEG, PNG, WebP 형식, 최대 5MB
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-instagram-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="text-sm font-semibold text-instagram-text-primary hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (name.trim() === user.name && !profileImage)
              }
              className="px-4 py-1.5 text-sm font-semibold bg-instagram-blue hover:bg-instagram-blue/90 text-white disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '제출'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

