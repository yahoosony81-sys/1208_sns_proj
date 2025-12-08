# Clerk 한국어 로컬라이제이션 가이드

이 문서는 Clerk 컴포넌트를 한국어로 설정하는 방법을 설명합니다.

## 개요

Clerk는 `@clerk/localizations` 패키지를 통해 다양한 언어의 로컬라이제이션을 제공합니다. 이 프로젝트는 한국어(ko-KR) 로컬라이제이션을 기본으로 사용합니다.

> **⚠️ 참고**: Clerk 로컬라이제이션 기능은 현재 실험적(experimental) 상태입니다. 문제가 발생하면 [Clerk 지원팀](https://clerk.com/contact/support)에 문의하세요.

## 현재 설정

프로젝트는 이미 한국어 로컬라이제이션이 적용되어 있습니다:

```tsx
// app/layout.tsx
import { koreanLocalization } from "@/lib/clerk/localization";

<ClerkProvider localization={koreanLocalization}>
  <html lang="ko">
    ...
  </html>
</ClerkProvider>
```

## 지원되는 언어

Clerk는 다음 언어를 지원합니다 (한국어 포함):

- 한국어 (ko-KR) - `koKR`
- 영어 (en-US) - `enUS`
- 일본어 (ja-JP) - `jaJP`
- 중국어 간체 (zh-CN) - `zhCN`
- 중국어 번체 (zh-TW) - `zhTW`
- 기타 50개 이상의 언어

전체 언어 목록은 [Clerk 공식 문서](https://clerk.com/docs/guides/customizing-clerk/localization#languages)를 참고하세요.

## 기본 사용법

### 1. 패키지 설치

`@clerk/localizations` 패키지는 이미 설치되어 있습니다:

```bash
pnpm install @clerk/localizations
```

### 2. 로컬라이제이션 적용

`lib/clerk/localization.ts` 파일에서 한국어 로컬라이제이션을 관리합니다:

```tsx
import { koKR } from "@clerk/localizations";

export const koreanLocalization = {
  ...koKR,
};
```

### 3. ClerkProvider에 적용

`app/layout.tsx`에서 `ClerkProvider`에 로컬라이제이션을 전달합니다:

```tsx
import { ClerkProvider } from "@clerk/nextjs";
import { koreanLocalization } from "@/lib/clerk/localization";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider localization={koreanLocalization}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## 커스텀 로컬라이제이션

특정 메시지를 커스터마이징하려면 `lib/clerk/localization.ts` 파일을 수정하세요:

### 예시 1: 로그인 화면 메시지 변경

```tsx
import { koKR } from "@clerk/localizations";

export const koreanLocalization = {
  ...koKR,
  signIn: {
    ...koKR.signIn,
    start: {
      title: "환영합니다",
      subtitle: "계정에 로그인하여 계속하세요",
    },
  },
};
```

### 예시 2: 회원가입 화면 메시지 변경

```tsx
export const koreanLocalization = {
  ...koKR,
  signUp: {
    ...koKR.signUp,
    start: {
      title: "계정 만들기",
      subtitle: "새 계정을 만들어 시작하세요",
    },
  },
};
```

### 예시 3: 에러 메시지 커스터마이징

```tsx
export const customErrorMessages = {
  ...koKR,
  unstable__errors: {
    ...koKR.unstable__errors,
    not_allowed_access:
      "접근이 허용되지 않았습니다. 이메일 도메인이 허용 목록에 추가되어 있지 않습니다. 문의사항이 있으시면 이메일로 연락해주세요.",
    form_identifier_not_found:
      "입력하신 이메일 주소로 등록된 계정을 찾을 수 없습니다.",
  },
};
```

사용 가능한 모든 에러 키는 [영어 로컬라이제이션 파일](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts)의 `unstable__errors` 객체에서 확인할 수 있습니다.

## 로컬라이제이션이 적용되는 컴포넌트

다음 Clerk 컴포넌트들이 한국어로 표시됩니다:

- `<SignIn />` - 로그인 컴포넌트
- `<SignUp />` - 회원가입 컴포넌트
- `<UserButton />` - 사용자 버튼
- `<SignInButton />` - 로그인 버튼
- `<SignUpButton />` - 회원가입 버튼
- 기타 모든 Clerk UI 컴포넌트

> **참고**: Clerk Account Portal(호스팅된 계정 관리 페이지)은 여전히 영어로 표시됩니다. 이는 Clerk의 제한사항입니다.

## 언어 변경

다른 언어로 변경하려면 `lib/clerk/localization.ts`를 수정하세요:

```tsx
import { enUS, jaJP } from "@clerk/localizations";

// 영어로 변경
export const localization = enUS;

// 일본어로 변경
export const localization = jaJP;
```

## 동적 언어 변경

사용자 선택에 따라 언어를 동적으로 변경하려면:

```tsx
'use client';

import { useState } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR, enUS } from '@clerk/localizations';

export default function App() {
  const [locale, setLocale] = useState<'ko' | 'en'>('ko');
  
  const localization = locale === 'ko' ? koKR : enUS;
  
  return (
    <ClerkProvider localization={localization}>
      <button onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}>
        언어 변경
      </button>
      {/* ... */}
    </ClerkProvider>
  );
}
```

## 문제 해결

### 로컬라이제이션이 적용되지 않음

1. `@clerk/localizations` 패키지가 설치되어 있는지 확인
2. `ClerkProvider`에 `localization` prop이 전달되었는지 확인
3. 개발 서버를 재시작
4. 브라우저 캐시를 지우고 다시 시도

### 일부 메시지가 여전히 영어로 표시됨

- 실험적 기능이므로 일부 메시지는 아직 번역되지 않았을 수 있습니다
- 커스텀 로컬라이제이션을 사용하여 해당 메시지를 직접 번역할 수 있습니다

### 에러 메시지 커스터마이징이 작동하지 않음

- `unstable__errors` 키를 정확히 사용했는지 확인
- 에러 키 이름이 올바른지 확인 (영어 로컬라이제이션 파일 참고)

## 참고 자료

- [Clerk 공식 로컬라이제이션 가이드](https://clerk.com/docs/guides/customizing-clerk/localization)
- [@clerk/localizations 패키지](https://www.npmjs.com/package/@clerk/localizations)
- [영어 로컬라이제이션 소스 코드](https://github.com/clerk/javascript/blob/main/packages/localizations/src/en-US.ts) - 커스터마이징 시 참고

## 현재 프로젝트 설정

프로젝트의 현재 설정:

- **기본 언어**: 한국어 (ko-KR)
- **설정 파일**: `lib/clerk/localization.ts`
- **적용 위치**: `app/layout.tsx`의 `ClerkProvider`
- **HTML lang 속성**: `lang="ko"`

설정을 변경하려면 `lib/clerk/localization.ts` 파일을 수정하세요.

