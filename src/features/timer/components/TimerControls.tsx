import type { TimerStatus } from '../../../types/timer'

type TimerControlsProps = {
  status: TimerStatus
  pipSupported: boolean
  onRunPrimaryAction: () => void
  onResetTimer: () => void
  onOpenPipWindow: () => void
}

const buttonBaseClass =
  'cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold leading-none transition-[transform,box-shadow,background] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] active:translate-y-0'

export const TimerControls = ({
  status,
  pipSupported,
  onRunPrimaryAction,
  onResetTimer,
  onOpenPipWindow,
}: TimerControlsProps) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <button
        type="button"
        className={`${buttonBaseClass} col-span-2 border-transparent bg-gradient-to-b from-tomato-primary-start to-tomato-primary-end text-white shadow-[0_10px_20px_rgba(144,61,18,0.26)] sm:col-span-1`}
        onClick={onRunPrimaryAction}
      >
        {status === 'running' ? '일시정지' : status === 'paused' ? '재개' : '시작'}
      </button>

      <button
        type="button"
        className={`${buttonBaseClass} border-tomato-border bg-gradient-to-b from-tomato-secondary-start to-tomato-secondary-end text-tomato-ink-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]`}
        onClick={onResetTimer}
      >
        리셋
      </button>

      <button
        type="button"
        className={`${buttonBaseClass} border-tomato-border-soft bg-gradient-to-b from-tomato-tertiary-start to-tomato-tertiary-end text-tomato-ghost shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0`}
        onClick={onOpenPipWindow}
        disabled={!pipSupported}
      >
        PiP 열기
      </button>
    </div>
  )
}
