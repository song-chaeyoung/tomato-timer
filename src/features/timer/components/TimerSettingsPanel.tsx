import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TIMER_SETTING_LIMITS } from '../../../constants/timer'
import type { TimerSettings } from '../../../types/timer'

type TimerSettingsPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: TimerSettings
  disabled: boolean
  onSave: (settings: TimerSettings) => void
}

type TimerSettingsDialogBodyProps = {
  settings: TimerSettings
  disabled: boolean
  onSave: (settings: TimerSettings) => void
  onOpenChange: (open: boolean) => void
}

type SettingField = {
  key: keyof TimerSettings
  label: string
  unit: string
}

const SETTINGS_FIELDS: SettingField[] = [
  { key: 'focusMinutes', label: '집중', unit: '분' },
  { key: 'shortBreakMinutes', label: '짧은 휴식', unit: '분' },
  { key: 'longBreakMinutes', label: '긴 휴식', unit: '분' },
  { key: 'longBreakInterval', label: '긴 휴식 주기', unit: '회' },
]

const inputBaseClass =
  'w-full rounded-lg border border-tomato-border-soft bg-[var(--color-surface-elevated)] px-3 py-2.5 text-[14px] font-semibold text-tomato-ink-strong transition-[border-color,background-color] focus:border-tomato-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-tomato-secondary-end disabled:text-tomato-meta'

const hasSettingsChanged = (current: TimerSettings, base: TimerSettings) => {
  return SETTINGS_FIELDS.some((field) => current[field.key] !== base[field.key])
}

export const TimerSettingsPanel = ({
  open,
  onOpenChange,
  settings,
  disabled,
  onSave,
}: TimerSettingsPanelProps) => {
  const dialogStateKey = SETTINGS_FIELDS.map((field) => settings[field.key]).join('-')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <TimerSettingsDialogBody
          key={dialogStateKey}
          settings={settings}
          disabled={disabled}
          onSave={onSave}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  )
}

const TimerSettingsDialogBody = ({
  settings,
  disabled,
  onSave,
  onOpenChange,
}: TimerSettingsDialogBodyProps) => {
  const [draftSettings, setDraftSettings] = useState(settings)
  const [isDirty, setIsDirty] = useState(false)

  const handleSave = () => {
    if (disabled || !isDirty) {
      return
    }
    onSave(draftSettings)
    onOpenChange(false)
  }

  return (
    <DialogContent className="max-w-[460px] rounded-[18px] border border-tomato-border-soft/60 bg-white/95 p-0">
      <DialogHeader className="gap-1 px-5 pt-5">
        <DialogTitle className="font-semibold tracking-[0.01em] text-tomato-ink-strong">세트 설정</DialogTitle>
        <DialogDescription className="text-[12px] leading-5 text-tomato-meta">
          {disabled ? '타이머 진행 중에는 설정을 바꿀 수 없어요.' : '값을 바꾼 뒤 저장 버튼을 눌러 적용하세요.'}
        </DialogDescription>
      </DialogHeader>

      <div className="px-5 pb-2">
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SETTINGS_FIELDS.map((field) => {
            const limits = TIMER_SETTING_LIMITS[field.key]
            return (
              <label key={field.key} className="flex flex-col gap-1.5">
                <span className="text-[12px] font-semibold text-tomato-subtle">{field.label}</span>
                <div className="relative">
                  <input
                    type="number"
                    min={limits.min}
                    max={limits.max}
                    step={1}
                    value={draftSettings[field.key]}
                    disabled={disabled}
                    className={inputBaseClass}
                    onChange={(event) => {
                      const parsed = Number(event.target.value)
                      if (Number.isNaN(parsed)) {
                        return
                      }

                      setDraftSettings((previous) => {
                        const nextDraft = { ...previous, [field.key]: parsed }
                        setIsDirty(hasSettingsChanged(nextDraft, settings))
                        return nextDraft
                      })
                    }}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-tomato-meta">
                    {field.unit}
                  </span>
                </div>
              </label>
            )
          })}
        </div>
      </div>

      <DialogFooter className="-mx-0 -mb-0 rounded-b-[18px] border-t border-tomato-border-soft/60 bg-white/82 px-5 py-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={disabled || !isDirty}
          className="bg-[var(--color-tomato-accent)] text-white hover:bg-[var(--color-tomato-accent)]/90"
        >
          저장
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
