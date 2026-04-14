import type { TimerPhase, TimerPhaseDurations, TimerSettings } from '../types/timer'

type SettingLimit = {
  min: number
  max: number
}

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
}

export const TIMER_SETTING_LIMITS: Record<keyof TimerSettings, SettingLimit> = {
  focusMinutes: { min: 5, max: 90 },
  shortBreakMinutes: { min: 1, max: 30 },
  longBreakMinutes: { min: 5, max: 60 },
  longBreakInterval: { min: 2, max: 8 },
}

export const PHASE_LABEL: Record<TimerPhase, string> = {
  focus: '집중',
  shortBreak: '짧은 휴식',
  longBreak: '긴 휴식',
}

const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

export const normalizeTimerSettings = (
  settings: Partial<TimerSettings>,
): TimerSettings => {
  const normalize = (key: keyof TimerSettings) => {
    const value = settings[key]
    const fallback = DEFAULT_TIMER_SETTINGS[key]
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return fallback
    }

    const limits = TIMER_SETTING_LIMITS[key]
    return clampNumber(Math.floor(value), limits.min, limits.max)
  }

  return {
    focusMinutes: normalize('focusMinutes'),
    shortBreakMinutes: normalize('shortBreakMinutes'),
    longBreakMinutes: normalize('longBreakMinutes'),
    longBreakInterval: normalize('longBreakInterval'),
  }
}

export const buildPhaseDurations = (settings: TimerSettings): TimerPhaseDurations => {
  return {
    focus: settings.focusMinutes * 60,
    shortBreak: settings.shortBreakMinutes * 60,
    longBreak: settings.longBreakMinutes * 60,
  }
}

export const getPhaseDurationSeconds = (phase: TimerPhase, settings: TimerSettings): number => {
  const durations = buildPhaseDurations(settings)
  return durations[phase]
}

export const TIMER_STORAGE_KEY = 'tomato.timer.snapshot.v2'
export const LEGACY_TIMER_STORAGE_KEY = 'tomato.timer.snapshot.v1'
export const PIP_CHANNEL_NAME = 'tomato.pip.v1'
