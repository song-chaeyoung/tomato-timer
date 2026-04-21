import { useMemo } from "react";
import { getPhaseDurationSeconds, PHASE_LABEL } from "../../../constants/timer";
import type {
  TimerPhase,
  TimerSettings,
  TimerStatus,
} from "../../../types/timer";
import { MODE_DIAL_THEME, STATUS_HINT_COPY } from "../constants/ui";
import { formatTime } from "../utils/time";

type TimerDialProps = {
  phase: TimerPhase;
  focusCountInSet: number;
  settings: TimerSettings;
  status: TimerStatus;
  remainingSeconds: number;
};

const STATUS_CHIP_THEME: Record<
  TimerStatus,
  { label: string; border: string; background: string; text: string }
> = {
  idle: {
    label: "대기",
    border: "var(--color-status-idle-border)",
    background: "var(--color-status-idle-bg)",
    text: "var(--color-status-idle-text)",
  },
  running: {
    label: "진행 중",
    border: "var(--color-status-running-border)",
    background: "var(--color-status-running-bg)",
    text: "var(--color-status-running-text)",
  },
  paused: {
    label: "일시정지",
    border: "var(--color-status-paused-border)",
    background: "var(--color-status-paused-bg)",
    text: "var(--color-status-paused-text)",
  },
};

export const TimerDial = ({
  phase,
  focusCountInSet,
  settings,
  status,
  remainingSeconds,
}: TimerDialProps) => {
  const totalPhaseSeconds = getPhaseDurationSeconds(phase, settings);
  const totalPhaseMinutes = Math.max(1, Math.floor(totalPhaseSeconds / 60));
  const progressPercent = Math.max(
    0,
    Math.min(100, (remainingSeconds / totalPhaseSeconds) * 100),
  );
  const dialTheme = MODE_DIAL_THEME[phase];
  const markUnitAngle = 360 / totalPhaseMinutes;
  const majorTickInterval = totalPhaseMinutes <= 10 ? 1 : 5;
  const dialMinuteMarks = useMemo(
    () => Array.from({ length: totalPhaseMinutes }, (_, index) => index),
    [totalPhaseMinutes],
  );

  const clockRingStyle = {
    background: `conic-gradient(
      from -90deg,
      ${dialTheme.fillStart} 0deg,
      ${dialTheme.fillEnd} ${progressPercent * 3.6}deg,
      ${dialTheme.empty} ${progressPercent * 3.6}deg,
      ${dialTheme.empty} 360deg
    )`,
    boxShadow: "inset 0 1px 1px var(--color-dial-gloss)",
  };

  const statusHint = STATUS_HINT_COPY[status];
  const statusChip = STATUS_CHIP_THEME[status];

  return (
    <section className="pixel-corners w-full rounded-[18px] border border-tomato-border-soft/55 bg-[var(--color-surface-quiet)] p-[clamp(12px,2vw,18px)]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p
          key={status}
          className="status-chip-shift m-0 inline-flex rounded-full border px-2.5 py-1 text-[12px] font-semibold leading-none tracking-[0.01em]"
          style={{
            borderColor: statusChip.border,
            backgroundColor: statusChip.background,
            color: statusChip.text,
          }}
        >
          {statusChip.label}
        </p>
        <p className="text-[12px] font-semibold text-tomato-meta">
          {PHASE_LABEL[phase]} {focusCountInSet}/{settings.longBreakInterval} ·{" "}
          {totalPhaseMinutes}분
        </p>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2.5">
        <div
          className="pixel-ring-surface relative aspect-square w-[min(100%,490px)] max-w-full rounded-[24px] p-3"
          style={{
            backgroundColor: dialTheme.frameBackground,
          }}
        >
          <span
            className="absolute left-1/2 top-[6px] h-[5px] w-10 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: dialTheme.badge }}
            aria-hidden="true"
          />
          <div
            className="relative h-full w-full overflow-hidden rounded-full border"
            style={{
              borderColor: dialTheme.ringBorder,
              backgroundColor: dialTheme.ringBackground,
            }}
          >
            <div
              className="absolute inset-[16px] rounded-full transition-[background] duration-[260ms] ease-linear"
              style={clockRingStyle}
              aria-hidden="true"
            />
            <div
              className="absolute inset-[64px] rounded-full"
              style={{
                backgroundColor: dialTheme.coreBackground,
                boxShadow: `0 2px 8px ${dialTheme.coreShadow}`,
              }}
              aria-hidden="true"
            />
            <div className="absolute inset-[20px]" aria-hidden="true">
              {dialMinuteMarks.map((value) => (
                <span
                  key={value}
                  className="absolute inset-0"
                  style={{
                    transform: `rotate(${value * markUnitAngle}deg)`,
                  }}
                >
                  <span
                    className="absolute left-1/2 top-[2%] -translate-x-1/2 rounded-full"
                    style={{
                      height: value % majorTickInterval === 0 ? "13px" : "7px",
                      width: value % majorTickInterval === 0 ? "2px" : "1.5px",
                      backgroundColor:
                        value % majorTickInterval === 0
                          ? dialTheme.tickMajor
                          : dialTheme.tickMinor,
                    }}
                  />
                </span>
              ))}
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p
                className="m-0 text-[clamp(31px,7.8vw,44px)] leading-none tracking-[0.02em] text-tomato-ink-strong tabular-nums"
                aria-live="polite"
              >
                {formatTime(remainingSeconds)}
              </p>
              <p className="m-0 mt-1 text-[12px] font-semibold tracking-[0.01em] text-tomato-meta">
                남은 시간
              </p>
            </div>
          </div>
        </div>
        <p className="m-0 text-center text-[13px] leading-5 text-tomato-help">
          {statusHint}
        </p>
      </div>
    </section>
  );
};
