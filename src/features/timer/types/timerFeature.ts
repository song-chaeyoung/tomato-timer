import type { TimerSnapshot, TimerStatus } from '../../../types/timer'

export type TimerWorkerControls = {
  start: (remainingSeconds: number) => void
  pause: () => void
  resume: () => void
  reset: (remainingSeconds: number) => void
  sync: (status: TimerStatus, remainingSeconds: number) => void
}

export type PipBridgeOptions = {
  snapshot: TimerSnapshot
  onStart: () => void
  onPause: () => void
  onResume: () => void
  onReset: () => void
}
