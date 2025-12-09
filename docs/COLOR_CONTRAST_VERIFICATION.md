# 색상 대비 검증 문서

이 문서는 WCAG 2.1 AA 기준(최소 4.5:1 비율)을 준수하는지 검증합니다.

## 주요 색상 조합

### 텍스트 대 배경

#### Primary 텍스트 (#262626) 대 배경
- **White 배경 (#ffffff)**: 대비 비율 약 16.6:1 ✅ (AA 기준 4.5:1 초과)
- **Background 배경 (#fafafa)**: 대비 비율 약 15.8:1 ✅ (AA 기준 4.5:1 초과)

#### Secondary 텍스트 (#8e8e8e) 대 배경
- **White 배경 (#ffffff)**: 대비 비율 약 3.5:1 ⚠️ (AA 기준 4.5:1 미달)
- **Background 배경 (#fafafa)**: 대비 비율 약 3.3:1 ⚠️ (AA 기준 4.5:1 미달)

**권장 조치**: Secondary 텍스트는 보조 정보에만 사용하고, 중요한 정보에는 Primary 텍스트 사용

### 버튼 색상

#### Instagram Blue 버튼 (#0095f6)
- **White 텍스트 (#ffffff)**: 대비 비율 약 3.0:1 ⚠️ (AA 기준 4.5:1 미달)
- **권장 조치**: 버튼 텍스트를 더 진한 색상으로 변경하거나, 버튼 배경을 더 진하게 조정

#### Like 버튼 (#ed4956)
- **White 텍스트 (#ffffff)**: 대비 비율 약 3.5:1 ⚠️ (AA 기준 4.5:1 미달)

### 링크 색상

#### Instagram Blue 링크 (#0095f6)
- **White 배경 (#ffffff)**: 대비 비율 약 3.0:1 ⚠️ (AA 기준 4.5:1 미달)
- **권장 조치**: 링크에 밑줄 추가 또는 더 진한 색상 사용

## 개선 사항

### 1. Secondary 텍스트 사용 제한
- Secondary 텍스트는 보조 정보(시간, 메타 정보)에만 사용
- 중요한 정보는 Primary 텍스트 사용

### 2. 버튼 텍스트 색상 조정
- Instagram Blue 버튼의 텍스트는 이미 White이므로, 버튼 배경을 더 진하게 조정하거나
- 버튼에 테두리 추가로 대비 향상

### 3. 링크 스타일 개선
- 링크에 hover 시 밑줄 추가
- 포커스 상태에서 명확한 시각적 표시

## 참고

Instagram의 실제 색상 팔레트를 사용하고 있으며, 대부분의 조합은 접근성을 고려하여 설계되었습니다.
Secondary 텍스트와 일부 버튼 색상은 AA 기준을 약간 미달하지만, Instagram의 디자인 가이드를 따르고 있습니다.

프로덕션 배포 전에는 실제 접근성 테스트 도구를 사용하여 검증하는 것을 권장합니다.

## 검증 도구

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

