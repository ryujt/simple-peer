# Simple-Peer 기능 트리 (Feature Tree)

## 📋 프로젝트 개요
Simple-Peer는 WebRTC를 위한 간단하고 강력한 Node.js 스타일 API를 제공하는 라이브러리입니다.

## 🌳 주요 기능 트리

### 1. 🔗 P2P 연결 관리 (Peer Connection Management)
```
├── 피어 초기화 (Peer Initialization)
│   ├── Initiator 모드
│   ├── Receiver 모드
│   └── 자동 ID 생성 (Random ID Generation)
│
├── 시그널링 (Signaling)
│   ├── Offer 생성
│   ├── Answer 생성
│   ├── SDP 교환
│   └── ICE Candidate 교환
│
└── 연결 상태 관리 (Connection State)
    ├── ICE 연결 상태 추적
    ├── 시그널링 상태 추적
    └── 연결 완료 감지
```

### 2. 📊 데이터 채널 (Data Channel)
```
├── 텍스트 데이터 전송
│   ├── 문자열 메시지
│   └── JSON 데이터
│
├── 바이너리 데이터 전송
│   ├── ArrayBuffer
│   ├── Buffer (Node.js)
│   └── Blob
│
├── 스트림 인터페이스
│   ├── Duplex Stream 구현
│   ├── 백프레셔 관리
│   └── 버퍼 크기 모니터링
│
└── 채널 설정
    ├── 채널 이름 커스터마이징
    ├── 협상 채널 (Negotiated Channel)
    └── 채널 설정 옵션
```

### 3. 📹 미디어 스트림 (Media Streams)
```
├── 비디오 스트림
│   ├── 비디오 트랙 추가
│   ├── 비디오 트랙 제거
│   └── 비디오 트랙 교체
│
├── 오디오 스트림
│   ├── 오디오 트랙 추가
│   ├── 오디오 트랙 제거
│   └── 오디오 트랙 교체
│
├── 스트림 관리
│   ├── MediaStream 추가
│   ├── MediaStream 제거
│   └── 다중 스트림 지원
│
└── 트랜시버 관리
    ├── 트랜시버 추가
    └── 동적 재협상
```

### 4. ⚙️ 고급 설정 (Advanced Configuration)
```
├── ICE 설정
│   ├── Trickle ICE 활성화/비활성화
│   ├── ICE 서버 구성 (STUN/TURN)
│   ├── ICE 완료 타임아웃
│   └── Half Trickle 지원
│
├── SDP 변환
│   ├── 커스텀 SDP 변환 함수
│   └── Offer/Answer 옵션
│
└── WebRTC 설정
    ├── RTCPeerConnection 설정
    ├── DataChannel 설정
    └── WRTC 구현 선택 (브라우저/Node.js)
```

### 5. 🎯 이벤트 시스템 (Event System)
```
├── 연결 이벤트
│   ├── 'connect' - 연결 성공
│   ├── 'close' - 연결 종료
│   └── 'error' - 오류 발생
│
├── 데이터 이벤트
│   ├── 'data' - 데이터 수신
│   └── 'stream' - 스트림 모드 데이터
│
├── 시그널링 이벤트
│   ├── 'signal' - 시그널링 데이터 생성
│   └── 재협상 요청
│
└── 미디어 이벤트
    ├── 'track' - 미디어 트랙 수신
    └── 'stream' - 미디어 스트림 수신
```

### 6. 🛠️ 유틸리티 기능 (Utility Features)
```
├── 디버깅
│   ├── Debug 로깅
│   └── 상태 모니터링
│
├── 에러 처리
│   ├── 커스텀 에러 코드
│   ├── 에러 복구
│   └── 경고 메시지
│
└── 성능 최적화
    ├── 버퍼 관리
    ├── 백프레셔 처리
    └── 메모리 관리
```

### 7. 🔧 플랫폼 지원 (Platform Support)
```
├── 브라우저 지원
│   ├── Chrome
│   ├── Firefox
│   ├── Safari
│   └── Edge
│
├── Node.js 지원
│   ├── wrtc 모듈 통합
│   └── 서버 사이드 P2P
│
└── 모바일 지원
    ├── React Native WebRTC
    └── 모바일 브라우저
```

### 8. 📦 통합 및 배포 (Integration & Deployment)
```
├── 빌드 시스템
│   ├── Browserify 번들링
│   ├── 독립 실행형 스크립트 (simplepeer.min.js)
│   └── NPM 패키지
│
├── 테스트
│   ├── 단위 테스트
│   ├── 브라우저 테스트 (Airtap)
│   └── 커버리지 분석
│
└── 문서화
    ├── API 문서
    ├── 예제 코드
    └── 에러 코드 참조
```

## 🎨 사용 사례 (Use Cases)

### 실시간 통신
- 화상 통화 애플리케이션
- 음성 채팅
- 실시간 협업 도구

### 데이터 전송
- P2P 파일 공유 (WebTorrent)
- 실시간 게임 데이터 동기화
- 분산 애플리케이션

### 스트리밍
- 라이브 비디오 스트리밍
- 스크린 공유
- 원격 데스크톱

## 📊 기술 스택

- **핵심 기술**: WebRTC, RTCPeerConnection, RTCDataChannel
- **의존성**: 
  - `buffer`: 버퍼 처리
  - `debug`: 디버깅 지원
  - `readable-stream`: 스트림 인터페이스
  - `get-browser-rtc`: WebRTC API 감지
  - `randombytes`: 보안 랜덤 값 생성
  - `queue-microtask`: 마이크로태스크 큐 관리

## 🚀 주요 특징

1. **간단한 API**: Node.js 스타일의 직관적인 인터페이스
2. **크로스 플랫폼**: 브라우저와 Node.js 모두 지원
3. **유연한 구성**: 다양한 WebRTC 옵션 커스터마이징 가능
4. **강력한 스트림 지원**: Node.js Duplex 스트림 인터페이스 구현
5. **활발한 커뮤니티**: WebTorrent 등 많은 프로젝트에서 사용