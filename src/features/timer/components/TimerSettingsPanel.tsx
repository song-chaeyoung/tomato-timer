import { TIMER_SETTING_LIMITS } from '../../../constants/timer'
import type { TimerSettings } from '../../../types/timer'

type TimerSettingsPanelProps = {
  settings: TimerSettings
  disabled: boolean
  onChangeSettings: (settings: Partial<TimerSettings>) => void
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
  'w-full rounded-xl border border-tomato-border-soft bg-[var(--color-surface-elevated)] px-3 py-2.5 text-[14px] font-semibold text-tomato-ink-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] transition-colors focus:border-tomato-accent focus:outline-none disabled:cursor-not-allowed disabled:bg-[#f4eee6] disabled:text-tomato-meta'

export const TimerSettingsPanel = ({
  settings,
  disabled,
  onChangeSettings,
}: TimerSettingsPanelProps) => {
  return (
    <section className="rounded-[22px] border border-tomato-border-soft bg-[var(--color-surface-quiet)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <h2 className="m-0 text-[14px] font-semibold tracking-[0.01em] text-tomato-ink-strong">세트 설정</h2>
        <p className="m-0 max-w-[220px] text-right text-[12px] leading-5 text-tomato-meta">
          {disabled ? '진행 중에는 수정할 수 없어요.' : '대기 상태에서 변경하면 즉시 반영돼요.'}
        </p>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5">
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
                  value={settings[field.key]}
                  disabled={disabled}
                  className={inputBaseClass}
                  onChange={(event) => {
                    const parsed = Number(event.target.value)
                    if (Number.isNaN(parsed)) {
                      return
                    }
                    onChangeSettings({ [field.key]: parsed })
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
    </section>
  )
}
