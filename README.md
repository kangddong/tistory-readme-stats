# Tistory Readme Stats

## 소개
Vercel Serverless Functions를 사용하여 Tistory 블로그의 통계를 SVG 뱃지로 제공하는 프로젝트입니다.

## 요구사항
- Node.js
- Vercel CLI

## 설치 및 실행
1. 저장소를 클론합니다.
   ```bash
   git clone <repository-url>
   cd tistory-readme-stats
   ```
2. 필요한 패키지를 설치합니다.
   ```bash
   npm install
   ```
3. TypeScript로 빌드합니다.
   ```bash
   npm run build
   ```
4. Vercel에 배포합니다.
   ```bash
   vercel --prod
   ```

## 환경 변수 설정
`.env` 파일에 다음과 같은 환경 변수를 설정합니다:
- `TISTORY_CLIENT_ID`: Tistory API 클라이언트 ID
- `CLIENT_SECRET`: Tistory API 클라이언트 시크릿
- `REDIRECT_URI`: OAuth2 리다이렉트 URI

## 사용 예시
- `https://<your-vercel-domain>/api/stats?blogName=<your-blog-name>`

## 배포 가이드
- Vercel에 프로젝트를 연결하고 환경 변수를 설정합니다.
- `npm run build && vercel --prod` 명령어로 배포합니다. 