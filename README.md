# 🧑‍🎨 LiveBoard

**실시간 협업이 가능한 화이트보드 웹 애플리케이션**

## 📌 프로젝트 소개

**LiveBoard**는 여러 사용자가 동시에 접속하여 실시간으로 그림을 그리고, PDF를 배경으로 추가하고, 이미지를 추가하고, 드래그로 이미지 위치 조정 및 삭제가 가능한 협업 화이트보드입니다.

## ✨ 주요 기능

### 🖌️ 캔버스 기능

- 실시간 드로잉 및 지우기 (Socket.IO 기반)
- 선마다 작성자 닉네임 표시
- 드로잉 되돌리기(Undo) 기능

### 🖼 이미지 관리

- 이미지 업로드 후 드래그 이동 가능
- 이미지 삭제 (우클릭 컨텍스트 메뉴)
- 이미지 선택 시 강조 테두리 표시
- 이미지는 다른 유저와 실시간 공유

### 📄 PDF 배경 업로드

- PDF 파일 업로드 시 첫 페이지 배경 적용
- 배경은 다른 유저와 실시간 공유

### 💬 채팅 기능

- 실시간 텍스트 채팅 (닉네임 포함)
- 채팅 입력 시 자동 스크롤

### 👥 사용자 관리

- 유저 닉네임 표시
- 접속자 목록 표시

## 💠 기술 스택

### Frontend

- **React + TypeScript**
- **Tailwind CSS** (유틸리티 기반 스타일링)
- **Zustand** (전역 상태 관리)
- **react-pdf** (PDF 렌더링)
- **react-hot-toast** (유저 방에 들어오고 나감 알림)

### Backend

- **Express.js**
- **Socket.IO** (실시간 통신)
- **MongoDB** (이미지/배경/채팅 로그 저장)

### 기타

- **Firebase Storage** (이미지 및 PDF 업로드)
- **AWS EC2 + Nginx + HTTPS**

## 🔒 보안

- 쿠키 기반 인증 (HTTPOnly, Secure)
- CORS 등 보안 헤더 설정

## 🚀 시작 방법

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
node server.js
```
