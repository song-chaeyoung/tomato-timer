import type { TimerStatus } from '../../../types/timer'

type TimerControlsProps = {
  status: TimerStatus
  pipSupported: boolean
  onRunPrimaryAction: () => void
  onResetTimer: () => void
  onOpenPipWindow: () => void
}

const buttonBaseClass =
  'cursor-pointer rounded-xl border px-4 py-3 text-sm font-semibold leading-none transition-[transform,box-shadow,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] active:translate-y-0'

export const TimerControls = ({
  status,
  pipSupported,
  onRunPrimaryAction,
  onResetTimer,
  onOpenPipWindow,
}: TimerControlsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <button
        type="button"
        className={`${buttonBaseClass} col-span-2 border-transparent bg-[var(--color-tomato-accent)] text-white shadow-[0_8px_18px_rgba(126,65,31,0.22)] hover:brightness-95 sm:col-span-1`}
        onClick={onRunPrimaryAction}
      >
        {status === 'running' ? '일시정지' : status === 'paused' ? '재개' : '시작'}
      </button>

      <button
        type="button"
        className={`${buttonBaseClass} border-tomato-border bg-tomato-secondary-start text-tomato-ink-strong hover:border-tomato-border/90 hover:bg-tomato-secondary-end`}
        onClick={onResetTimer}
      >
        리셋
      </button>

      <button
        type="button"
        className={`${buttonBaseClass} border-tomato-border-soft bg-tomato-tertiary-start text-tomato-ghost hover:border-tomato-border hover:bg-tomato-tertiary-end disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0`}
        onClick={onOpenPipWindow}
        disabled={!pipSupported}
      >
        PiP 열기
      </button>
    </div>
  )
}
