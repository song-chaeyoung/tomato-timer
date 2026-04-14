# Tomato

부드러운 레트로 감성으로 만든 포모도로 타이머입니다.  
집중, 짧은 휴식, 긴 휴식 사이클을 한 화면에서 관리할 수 있고, 브라우저가 지원하면 Document Picture-in-Picture(PiP)로 작은 타이머 창도 함께 사용할 수 있습니다.

- 기본 사이클: 집중 25분, 짧은 휴식 5분, 긴 휴식 15분, 긴 휴식 주기 4회
- 배포 주소: https://tomato-chi-liart.vercel.app/

## 프로젝트 개요

이 프로젝트는 단순 카운트다운보다 포모도로 루틴 전체를 매끄럽게 다루는 데 초점을 둡니다.

- 집중, 짧은 휴식, 긴 휴식이 자동으로 순환합니다.
- 긴 휴식 주기까지 포함한 세션 흐름을 상태로 관리합니다.
- Web Worker 기반으로 타이머 계산을 분리해 UI와 타이머 루프를 분리합니다.
- `localStorage` 스냅샷을 통해 새로고침 이후에도 진행 상태를 복원합니다.
- PiP 창과 메인 창이 `BroadcastChannel`로 동기화됩니다.

## 주요 기능

### 1. 포모도로 세션 관리

- `focus`
- `shortBreak`
- `longBreak`

현재 세션 단계와 집중 세트 진행 수(`focusCountInSet`)를 기준으로 다음 단계가 자동 결정됩니다.

### 2. 타이머 제어

- 시작
- 일시정지
- 재개
- 전체 초기화

타이머가 완료되면 다음 단계로 자동 전환되고, 브라우저 알림과 완료 사운드를 함께 처리합니다.

### 3. 사용자 설정

아래 값을 직접 변경할 수 있습니다.

- 집중 시간
- 짧은 휴식 시간
- 긴 휴식 시간
- 긴 휴식 주기

설정값은 범위를 제한하고 정수로 보정합니다. 진행 중에는 변경되지 않도록 막아 둡니다.

### 4. 세션 복원

- 마지막 타이머 상태를 `localStorage`에 저장합니다.
- 페이지를 다시 열면 저장된 스냅샷을 복원합니다.
- 실행 중이던 타이머는 마지막 저장 시각을 기준으로 경과 시간을 반영해 남은 시간을 다시 계산합니다.

### 5. PiP 모드

브라우저가 Document PiP API를 지원하면 작은 타이머 창을 열 수 있습니다.

- 메인 창과 같은 진행 상태를 표시합니다.
- 상태 버튼으로 시작, 일시정지, 재개를 제어할 수 있습니다.
- 메인 창과 PiP 창이 `BroadcastChannel`로 상태를 주고받습니다.

PiP는 지원 브라우저에서만 동작하며, 미지원 환경에서는 메인 타이머만 사용할 수 있습니다.

## 기술 스택

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand
- Web Worker
- BroadcastChannel
- Notification API
- Document Picture-in-Picture API

## 실행 방법

### pnpm

```bash
pnpm install
pnpm dev
```

프로덕션 빌드:

```bash
pnpm build
pnpm start
```

### npm

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run start
```

## 디렉터리 구조

```text
app/
- favicon.ico                         # 앱 파비콘
- globals.css                         # 전역 스타일과 테마 토큰
- layout.tsx                          # 루트 레이아웃과 메타데이터
- page.tsx                            # 메인 페이지 엔트리
- timer-client.tsx                    # 클라이언트 전용 타이머 앱 진입점

public/
- LOGO.png                            # 앱 로고

src/
- App.tsx                             # 메인 화면 조합
- constants/
  - timer.ts                          # 기본 타이머 설정과 공통 상수
- store/
  - timerStore.ts                     # Zustand 기반 타이머 상태 저장소
- types/
  - timer.ts                          # 공통 타입 정의
- workers/
  - timer.worker.ts                   # Web Worker 타이머 루프
- features/timer/
  - components/
    - TimerControls.tsx               # 시작/정지/재개/리셋 버튼
    - TimerDial.tsx                   # 원형 다이얼 UI
    - TimerSettingsPanel.tsx          # 설정 패널
  - hooks/
    - usePipBridge.ts                 # PiP 브리지
    - useTimerWorker.ts               # Worker 연결
  - pip/
    - mountPipUi.ts                   # PiP 창 UI 마운트
  - utils/
    - audio.ts                        # 완료 사운드
    - snapshot.ts                     # 저장/복원 로직
    - time.ts                         # 시간 포맷 유틸
  - constants/
    - ui.ts                           # 단계별 다이얼/상태 UI 상수
  - types/
    - timerFeature.ts                 # feature 내부 타입
```

## 동작 방식

### 상태 관리

전역 타이머 상태는 `Zustand`로 관리합니다.

- 현재 단계
- 현재 집중 세트 수
- 설정값
- 진행 상태 (`idle`, `running`, `paused`)
- 남은 시간
- 마지막 갱신 시각

### 타이머 정확도 처리

실제 카운트다운은 `src/workers/timer.worker.ts`에서 수행합니다.

- 메인 스레드가 아닌 Worker에서 동작합니다.
- `deadlineAt - Date.now()` 방식으로 남은 시간을 계산합니다.
- 250ms 간격으로 체크하되 초 단위 값이 바뀔 때만 UI를 갱신합니다.

이 구조로 단순 `setInterval` 기반 UI 타이머보다 상태 계산과 렌더링을 분리할 수 있습니다.

### 복원 로직

실행 중 스냅샷을 다시 읽을 때는 저장 시점 이후 경과 시간을 다시 계산해서 남은 시간을 보정합니다.  
즉 새로고침 직후에도 이전 시점 그대로 멈춰 있는 것이 아니라 실제 경과 시간이 반영된 값으로 이어집니다.

## UI 방향

- 한 화면 중심의 단일 페이지 구성
- 소프트 레트로 픽셀 감성
- 단계별 색상이 바뀌는 원형 다이얼
- 모바일과 데스크톱을 모두 고려한 반응형 레이아웃

## 브라우저 관련 참고

- 알림은 브라우저가 `Notification API`를 지원하고 권한이 허용된 경우에만 표시합니다.
- 완료 사운드는 `AudioContext`를 사용할 수 있을 때만 재생합니다.
- PiP는 `documentPictureInPicture`를 지원하는 브라우저에서만 사용할 수 있습니다.

