# Simple-Peer Video Conference & Whiteboard Example

1:1 화상회의와 화이트보드 공유 기능을 제공하는 WebRTC 애플리케이션 예제입니다.

## 🚀 주요 기능

- **화상/음성 통화**: 1:1 실시간 비디오 및 오디오 통신
- **화이트보드 공유**: 실시간 그리기 도구로 협업
- **텍스트 채팅**: 메시지 전송 기능
- **룸 기반 연결**: 룸 ID를 통한 간편한 연결

## 📋 필요 사항

- Node.js (v14 이상)
- 최신 브라우저 (Chrome, Firefox, Safari, Edge)
- 카메라 및 마이크 권한

## 🛠️ 설치 및 실행

1. **의존성 설치**
```bash
cd examples/video-whiteboard
npm install
```

2. **서버 실행**
```bash
npm start
# 또는 개발 모드 (자동 재시작)
npm run dev
```

3. **브라우저에서 접속**
```
http://localhost:3000
```

## 📖 사용 방법

### 방 만들기 및 참여하기

1. **새 방 만들기**: 
   - 첫 번째 브라우저에서 http://localhost:3000 접속
   - 룸 ID 입력 없이 "Join Room" 클릭
   - 자동으로 생성된 룸 ID 확인

2. **방 참여하기**:
   - 두 번째 브라우저/탭에서 http://localhost:3000 접속
   - 생성된 룸 ID 입력
   - "Join Room" 클릭

### 화상 통화 컨트롤

- **📹 비디오 켜기/끄기**: 비디오 버튼 클릭
- **🎤 음소거/해제**: 마이크 버튼 클릭

### 화이트보드 사용법

- **그리기**: 마우스 드래그 또는 터치
- **색상 선택**: 색상 팔레트에서 원하는 색 선택
- **브러시 크기**: 슬라이더로 조절
- **지우개**: 🧹 Eraser 버튼
- **실행 취소**: ↩️ Undo 버튼
- **전체 지우기**: 🗑️ Clear 버튼 (모든 사용자의 화면 초기화)
- **저장**: 💾 Save 버튼으로 PNG 이미지 다운로드

### 채팅

- 하단의 채팅 입력창에 메시지 입력
- Enter 키 또는 Send 버튼으로 전송

## 🏗️ 프로젝트 구조

```
video-whiteboard/
├── server.js           # Express + Socket.io 시그널링 서버
├── package.json        # 프로젝트 설정 및 의존성
├── README.md          # 문서
└── public/
    ├── index.html     # 메인 HTML 페이지
    ├── style.css      # 스타일시트
    └── app.js         # 클라이언트 JavaScript (SimplePeer 로직)
```

## 🔧 기술 스택

- **Frontend**:
  - SimplePeer (WebRTC 래퍼)
  - Socket.io Client (시그널링)
  - Canvas API (화이트보드)
  - HTML5 Media API

- **Backend**:
  - Node.js
  - Express (웹 서버)
  - Socket.io (실시간 통신)

## ⚙️ 설정 옵션

### STUN/TURN 서버 설정

`public/app.js`에서 ICE 서버 설정을 수정할 수 있습니다:

```javascript
config: {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // TURN 서버 추가 (NAT 환경용)
        {
            urls: 'turn:your-turn-server.com:3478',
            username: 'username',
            credential: 'password'
        }
    ]
}
```

### 포트 변경

환경 변수로 포트 설정:
```bash
PORT=8080 npm start
```

## 🐛 문제 해결

### 카메라/마이크 접근 오류
- 브라우저 설정에서 카메라/마이크 권한 확인
- HTTPS 환경에서는 `getUserMedia` API가 더 안정적으로 작동

### 연결 실패
- 방화벽 설정 확인
- 같은 네트워크에 있는지 확인
- NAT 환경에서는 TURN 서버 필요

### 화이트보드 동기화 문제
- 네트워크 지연이 있을 수 있음
- 브라우저 개발자 도구에서 콘솔 오류 확인

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 PR은 언제나 환영합니다!