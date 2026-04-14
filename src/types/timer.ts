export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused'

export type TimerSettings = {
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
}

export type TimerPhaseDurations = Record<TimerPhase, number>

export type TimerSnapshot = {
  phase: TimerPhase
  focusCountInSet: number
  settings: TimerSettings
  status: TimerStatus
  remainingSeconds: number
  lastUpdatedAt: number
}

export type WorkerCommand =
  | { type: 'START'; remainingSeconds: number }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESET'; remainingSeconds: number }
  | { type: 'SYNC'; status: TimerStatus; remainingSeconds: number }

export type WorkerEvent =
  | { type: 'TICK'; remainingSeconds: number; at: number }
  | {
      type: 'STATE'
      status: TimerStatus
      remainingSeconds: number
      at: number
    }
  | { type: 'COMPLETED'; at: number }

export type PipControlAction =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'RESET'

export type PipMessageToMain =
  | { type: 'REQUEST_SYNC' }
  | { type: 'CONTROL'; action: PipControlAction }

export type PipMessageFromMain = {
  type: 'SNAPSHOT'
  snapshot: TimerSnapshot
  durations: TimerPhaseDurations
}
