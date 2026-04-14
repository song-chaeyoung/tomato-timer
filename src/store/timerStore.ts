import { create } from 'zustand'
import {
  DEFAULT_TIMER_SETTINGS,
  getPhaseDurationSeconds,
  normalizeTimerSettings,
} from '../constants/timer'
import type { TimerPhase, TimerSettings, TimerSnapshot, TimerStatus } from '../types/timer'

type TimerStore = TimerSnapshot & {
  setStatus: (status: TimerStatus) => void
  setRemainingSeconds: (remainingSeconds: number, at?: number) => void
  resetCurrentPhase: () => void
  resetAll: () => TimerSnapshot
  applySettings: (settings: Partial<TimerSettings>) => void
  hydrate: (snapshot: TimerSnapshot) => void
  advancePhaseAfterCompletion: (at?: number) => TimerSnapshot
}

const INITIAL_PHASE: TimerPhase = 'focus'

const makeInitialSnapshot = (): TimerSnapshot => ({
  phase: INITIAL_PHASE,
  focusCountInSet: 1,
  settings: DEFAULT_TIMER_SETTINGS,
  status: 'idle',
  remainingSeconds: getPhaseDurationSeconds(INITIAL_PHASE, DEFAULT_TIMER_SETTINGS),
  lastUpdatedAt: Date.now(),
})

const getNextPhaseSnapshot = (snapshot: TimerSnapshot, at: number): TimerSnapshot => {
  const currentFocusCount = Math.min(
    Math.max(1, snapshot.focusCountInSet),
    snapshot.settings.longBreakInterval,
  )

  let nextPhase: TimerPhase
  let nextFocusCount = currentFocusCount

  if (snapshot.phase === 'focus') {
    nextPhase =
      currentFocusCount >= snapshot.settings.longBreakInterval ? 'longBreak' : 'shortBreak'
  } else if (snapshot.phase === 'shortBreak') {
    nextPhase = 'focus'
    nextFocusCount = Math.min(snapshot.settings.longBreakInterval, currentFocusCount + 1)
  } else {
    nextPhase = 'focus'
    nextFocusCount = 1
  }

  return {
    phase: nextPhase,
    focusCountInSet: nextFocusCount,
    settings: snapshot.settings,
    status: 'idle',
    remainingSeconds: getPhaseDurationSeconds(nextPhase, snapshot.settings),
    lastUpdatedAt: at,
  }
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  ...makeInitialSnapshot(),
  setStatus: (status) => {
    set({ status, lastUpdatedAt: Date.now() })
  },
  setRemainingSeconds: (remainingSeconds, at = Date.now()) => {
    set({ remainingSeconds: Math.max(0, remainingSeconds), lastUpdatedAt: at })
  },
  resetCurrentPhase: () => {
    const { phase, settings, focusCountInSet } = get()
    set({
      phase,
      focusCountInSet,
      settings,
      status: 'idle',
      remainingSeconds: getPhaseDurationSeconds(phase, settings),
      lastUpdatedAt: Date.now(),
    })
  },
  resetAll: () => {
    let nextSnapshot: TimerSnapshot = makeInitialSnapshot()
    set(() => {
      nextSnapshot = makeInitialSnapshot()
      return nextSnapshot
    })
    return nextSnapshot
  },
  applySettings: (settings) => {
    set((state) => {
      const nextSettings = normalizeTimerSettings({
        ...state.settings,
        ...settings,
      })
      const nextFocusCount = Math.min(
        Math.max(1, state.focusCountInSet),
        nextSettings.longBreakInterval,
      )
      const nextRemainingSeconds =
        state.status === 'idle'
          ? getPhaseDurationSeconds(state.phase, nextSettings)
          : state.remainingSeconds

      return {
        phase: state.phase,
        focusCountInSet: nextFocusCount,
        settings: nextSettings,
        status: state.status,
        remainingSeconds: nextRemainingSeconds,
        lastUpdatedAt: Date.now(),
      }
    })
  },
  hydrate: (snapshot) => {
    const nextSettings = normalizeTimerSettings(snapshot.settings)
    const normalizedFocusCount = Math.min(
      Math.max(1, snapshot.focusCountInSet),
      nextSettings.longBreakInterval,
    )

    set({
      ...snapshot,
      settings: nextSettings,
      focusCountInSet: normalizedFocusCount,
      remainingSeconds: Math.max(0, Math.floor(snapshot.remainingSeconds)),
    })
  },
  advancePhaseAfterCompletion: (at = Date.now()) => {
    let nextSnapshot: TimerSnapshot = makeInitialSnapshot()
    set((state) => {
      nextSnapshot = getNextPhaseSnapshot(state, at)
      return nextSnapshot
    })
    return nextSnapshot
  },
}))

export const buildSnapshot = (
  phase: TimerPhase,
  focusCountInSet: number,
  settings: TimerSettings,
  status: TimerStatus,
  remainingSeconds: number,
  lastUpdatedAt: number,
): TimerSnapshot => ({
  phase,
  focusCountInSet,
  settings,
  status,
  remainingSeconds,
  lastUpdatedAt,
})
