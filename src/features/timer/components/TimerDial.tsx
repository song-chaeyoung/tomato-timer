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
  };

  const statusHint = STATUS_HINT_COPY[status];

  return (
    <section className="rounded-[26px] border border-tomato-border-soft/95 bg-[var(--color-surface-quiet)] p-[clamp(16px,2.8vw,24px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_14px_34px_rgba(108,56,21,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* <p
          key={status}
          className="status-chip-shift m-0 inline-flex rounded-full border px-3 py-1 text-[12px] font-semibold leading-none tracking-[0.01em]"
          style={{
            borderColor: statusTone.border,
            backgroundColor: statusTone.background,
            color: statusTone.text,
          }}
        >
          {statusContent.label}
        </p> */}
        <p className="w-full text-right text-[12px] font-semibold text-tomato-meta">
          {PHASE_LABEL[phase]} {focusCountInSet}/{settings.longBreakInterval} ·{" "}
          {totalPhaseMinutes}분
        </p>
      </div>

      <div className="mt-3.5 flex flex-col items-center gap-3">
        <div
          className="relative aspect-square w-[clamp(236px,64vw,344px)] max-w-full rounded-[30px] border p-3 shadow-[0_12px_30px_rgba(97,59,31,0.12)]"
          style={{
            borderColor: dialTheme.frameBorder,
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
              className="absolute inset-[16px] rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] transition-[background] duration-[260ms] ease-linear"
              style={clockRingStyle}
              aria-hidden="true"
            />
            <div
              className="absolute inset-[64px] rounded-full border"
              style={{
                borderColor: dialTheme.coreBorder,
                backgroundColor: dialTheme.coreBackground,
                boxShadow: `0 4px 10px ${dialTheme.coreShadow}`,
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
                className="m-0 text-[clamp(33px,8.6vw,50px)] leading-none tracking-[0.04em] text-tomato-ink-strong tabular-nums"
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
