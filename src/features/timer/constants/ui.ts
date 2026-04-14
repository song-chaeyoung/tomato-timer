import type { TimerPhase, TimerStatus } from '../../../types/timer'

export type TimerDialTheme = {
  fillStart: string
  fillEnd: string
  empty: string
  badge: string
  frameBorder: string
  frameBackground: string
  ringBorder: string
  ringBackground: string
  tickMinor: string
  tickMajor: string
  coreBorder: string
  coreBackground: string
  coreShadow: string
}

export const MODE_DIAL_THEME: Record<TimerPhase, TimerDialTheme> = {
  focus: {
    fillStart: 'var(--color-phase-focus-start)',
    fillEnd: 'var(--color-phase-focus-end)',
    empty: 'var(--color-phase-focus-empty)',
    badge: 'var(--color-phase-focus-badge)',
    frameBorder: 'var(--color-phase-focus-frame-border)',
    frameBackground: 'var(--color-phase-focus-frame-bg)',
    ringBorder: 'var(--color-phase-focus-ring-border)',
    ringBackground: 'var(--color-phase-focus-ring-bg)',
    tickMinor: 'var(--color-phase-focus-tick-minor)',
    tickMajor: 'var(--color-phase-focus-tick-major)',
    coreBorder: 'var(--color-phase-focus-core-border)',
    coreBackground: 'var(--color-phase-focus-core-bg)',
    coreShadow: 'var(--color-phase-focus-core-shadow)',
  },
  shortBreak: {
    fillStart: 'var(--color-phase-short-start)',
    fillEnd: 'var(--color-phase-short-end)',
    empty: 'var(--color-phase-short-empty)',
    badge: 'var(--color-phase-short-badge)',
    frameBorder: 'var(--color-phase-short-frame-border)',
    frameBackground: 'var(--color-phase-short-frame-bg)',
    ringBorder: 'var(--color-phase-short-ring-border)',
    ringBackground: 'var(--color-phase-short-ring-bg)',
    tickMinor: 'var(--color-phase-short-tick-minor)',
    tickMajor: 'var(--color-phase-short-tick-major)',
    coreBorder: 'var(--color-phase-short-core-border)',
    coreBackground: 'var(--color-phase-short-core-bg)',
    coreShadow: 'var(--color-phase-short-core-shadow)',
  },
  longBreak: {
    fillStart: 'var(--color-phase-long-start)',
    fillEnd: 'var(--color-phase-long-end)',
    empty: 'var(--color-phase-long-empty)',
    badge: 'var(--color-phase-long-badge)',
    frameBorder: 'var(--color-phase-long-frame-border)',
    frameBackground: 'var(--color-phase-long-frame-bg)',
    ringBorder: 'var(--color-phase-long-ring-border)',
    ringBackground: 'var(--color-phase-long-ring-bg)',
    tickMinor: 'var(--color-phase-long-tick-minor)',
    tickMajor: 'var(--color-phase-long-tick-major)',
    coreBorder: 'var(--color-phase-long-core-border)',
    coreBackground: 'var(--color-phase-long-core-bg)',
    coreShadow: 'var(--color-phase-long-core-shadow)',
  },
}

export const STATUS_COPY: Record<TimerStatus, { label: string }> = {
  idle: {
    label: '시작 대기',
  },
  running: {
    label: '진행 중',
  },
  paused: {
    label: '잠시 멈춤',
  },
}

export const STATUS_HINT_COPY: Record<TimerStatus, string> = {
  idle: '다음 단계가 준비됐습니다. 시작 버튼으로 이어서 진행하세요.',
  running: '현재 단계를 끝까지 유지하면 다음 단계로 자동 전환됩니다.',
  paused: '재개하면 현재 단계를 이어서 완료할 수 있습니다.',
}

export type TimerStatusTone = {
  border: string
  background: string
  text: string
}

export const STATUS_TONE: Record<TimerStatus, TimerStatusTone> = {
  idle: {
    border: 'var(--color-status-idle-border)',
    background: 'var(--color-status-idle-bg)',
    text: 'var(--color-status-idle-text)',
  },
  running: {
    border: 'var(--color-status-running-border)',
    background: 'var(--color-status-running-bg)',
    text: 'var(--color-status-running-text)',
  },
  paused: {
    border: 'var(--color-status-paused-border)',
    background: 'var(--color-status-paused-bg)',
    text: 'var(--color-status-paused-text)',
  },
}
