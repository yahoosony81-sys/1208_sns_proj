import { koKR } from "@clerk/localizations";

/**
 * Clerk 한국어 로컬라이제이션 설정
 *
 * @clerk/localizations 패키지의 koKR을 기본으로 사용하며,
 * 필요시 커스텀 메시지를 추가할 수 있습니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
export const koreanLocalization = {
  ...koKR,
  // 필요시 특정 메시지를 커스터마이징할 수 있습니다
  // 예시:
  // signIn: {
  //   start: {
  //     title: "환영합니다",
  //     subtitle: "계정에 로그인하세요",
  //   },
  // },
};

/**
 * 커스텀 에러 메시지 설정
 *
 * Clerk의 기본 에러 메시지를 한국어로 커스터마이징합니다.
 * unstable__errors 키를 사용하여 특정 에러 메시지를 변경할 수 있습니다.
 *
 * @example
 * ```tsx
 * import { customErrorMessages } from '@/lib/clerk/localization';
 *
 * <ClerkProvider localization={customErrorMessages}>
 *   ...
 * </ClerkProvider>
 * ```
 */
export const customErrorMessages = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    // 특정 에러 메시지 커스터마이징 예시
    // not_allowed_access:
    //   "접근이 허용되지 않았습니다. 이메일 도메인이 허용 목록에 추가되어 있지 않습니다.",
  },
};

