# OAuth client_id 설정 가이드

## 1. Google Cloud Console 프로젝트 생성
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

## 2. API 활성화
1. "API 및 서비스" → "라이브러리" 이동
2. "Google Calendar API" 검색 후 활성화

## 3. OAuth 동의 화면 설정
1. "API 및 서비스" → "OAuth 동의 화면" 이동
2. 사용자 유형 선택(외부/내부)
3. 앱 이름, 이메일 등 기본 정보 입력 후 저장

## 4. OAuth 클라이언트 ID 생성
1. "API 및 서비스" → "사용자 인증 정보" 이동
2. "사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
3. 애플리케이션 유형: "Chrome 확장 프로그램"
4. 확장 프로그램 ID 입력
   - Chrome 확장프로그램 로드 후 확장 프로그램 관리 페이지에서 확인 가능
5. 생성 완료 후 클라이언트 ID 복사

## 5. manifest.json에 client_id 적용
- 파일: D:\git\google-calendar-extension\manifest.json
- 아래 항목의 client_id를 실제 값으로 교체

```
"oauth2": {
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "scopes": ["https://www.googleapis.com/auth/calendar.events"]
}
```

## 6. 재로드
1. Chrome 확장프로그램 관리 페이지에서 확장프로그램 "다시 로드"
2. OAuth 권한 요청 정상 동작 확인
