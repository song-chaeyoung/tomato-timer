import {
  DEFAULT_TIMER_SETTINGS,
  LEGACY_TIMER_STORAGE_KEY,
  normalizeTimerSettings,
  TIMER_STORAGE_KEY,
} from '../../../constants/timer'
import type { TimerPhase, TimerSnapshot, TimerStatus } from '../../../types/timer'

type LegacyTimerMode = 'pomodoro' | 'shortBreak' | 'longBreak'

type LegacyTimerSnapshot = {
  mode: LegacyTimerMode
  status: TimerStatus
  remainingSeconds: number
  lastUpdatedAt: number
}

const isTimerPhase = (value: unknown): value is TimerPhase => {
  return value === 'focus' || value === 'shortBreak' || value === 'longBreak'
}

const isLegacyTimerMode = (value: unknown): value is LegacyTimerMode => {
  return value === 'pomodoro' || value === 'shortBreak' || value === 'longBreak'
}

const isTimerStatus = (value: unknown): value is TimerStatus => {
  return value === 'idle' || value === 'running' || value === 'paused'
}

const parseStoredObject = (key: string): Record<string, unknown> | null => {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

const parseV2Snapshot = (value: Record<string, unknown>): TimerSnapshot | null => {
  const phase = value.phase
  const status = value.status
  const remainingSeconds = value.remainingSeconds
  const lastUpdatedAt = value.lastUpdatedAt
  const focusCountInSet = value.focusCountInSet
  const settings = value.settings

  if (
    !isTimerPhase(phase) ||
    !isTimerStatus(status) ||
    typeof remainingSeconds !== 'number' ||
    typeof lastUpdatedAt !== 'number' ||
    typeof focusCountInSet !== 'number' ||
    !settings ||
    typeof settings !== 'object'
  ) {
    return null
  }

  const normalizedSettings = normalizeTimerSettings(settings)
  const normalizedFocusCount = Math.min(
    Math.max(1, Math.floor(focusCountInSet)),
    normalizedSettings.longBreakInterval,
  )

  return {
    phase,
    focusCountInSet: normalizedFocusCount,
    settings: normalizedSettings,
    status,
    remainingSeconds: Math.max(0, Math.floor(remainingSeconds)),
    lastUpdatedAt,
  }
}

const parseLegacySnapshot = (value: Record<string, unknown>): LegacyTimerSnapshot | null => {
  const mode = value.mode
  const status = value.status
  const remainingSeconds = value.remainingSeconds
  const lastUpdatedAt = value.lastUpdatedAt

  if (
    !isLegacyTimerMode(mode) ||
    !isTimerStatus(status) ||
    typeof remainingSeconds !== 'number' ||
    typeof lastUpdatedAt !== 'number'
  ) {
    return null
  }

  return {
    mode,
    status,
    remainingSeconds: Math.max(0, Math.floor(remainingSeconds)),
    lastUpdatedAt,
  }
}

const migrateLegacySnapshot = (legacy: LegacyTimerSnapshot): TimerSnapshot => {
  const phaseMap: Record<LegacyTimerMode, TimerPhase> = {
    pomodoro: 'focus',
    shortBreak: 'shortBreak',
    longBreak: 'longBreak',
  }
  const focusCountMap: Record<LegacyTimerMode, number> = {
    pomodoro: 1,
    shortBreak: 1,
    longBreak: DEFAULT_TIMER_SETTINGS.longBreakInterval,
  }

  return {
    phase: phaseMap[legacy.mode],
    focusCountInSet: focusCountMap[legacy.mode],
    settings: DEFAULT_TIMER_SETTINGS,
    status: legacy.status,
    remainingSeconds: legacy.remainingSeconds,
    lastUpdatedAt: legacy.lastUpdatedAt,
  }
}

export const readStoredSnapshot = (): TimerSnapshot | null => {
  const v2Raw = parseStoredObject(TIMER_STORAGE_KEY)
  if (v2Raw) {
    const parsedV2 = parseV2Snapshot(v2Raw)
    if (parsedV2) {
      return parsedV2
    }
  }

  const legacyRaw = parseStoredObject(LEGACY_TIMER_STORAGE_KEY)
  if (!legacyRaw) {
    return null
  }

  const legacy = parseLegacySnapshot(legacyRaw)
  if (!legacy) {
    return null
  }

  return migrateLegacySnapshot(legacy)
}

export const restoreSnapshot = (snapshot: TimerSnapshot): TimerSnapshot => {
  if (snapshot.status !== 'running') {
    return {
      ...snapshot,
      lastUpdatedAt: Date.now(),
    }
  }

  const elapsedSeconds = Math.floor((Date.now() - snapshot.lastUpdatedAt) / 1000)
  const restoredRemaining = Math.max(0, snapshot.remainingSeconds - elapsedSeconds)

  return {
    ...snapshot,
    status: restoredRemaining > 0 ? 'running' : 'idle',
    remainingSeconds: restoredRemaining,
    lastUpdatedAt: Date.now(),
  }
}
