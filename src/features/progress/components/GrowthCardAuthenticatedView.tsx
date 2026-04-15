"use client";

import Image from "next/image";
import type { ProgressSnapshot } from "@/src/types/progress";

type GrowthCardAuthenticatedViewProps = {
  progress: ProgressSnapshot | null;
  isLoading: boolean;
  error: string | null;
  formatCount: (value: number) => string;
  formatMinutes: (value: number) => string;
};

export const GrowthCardAuthenticatedView = ({
  progress,
  isLoading,
  error,
  formatCount,
  formatMinutes,
}: GrowthCardAuthenticatedViewProps) => {
  const completionSummary = formatCount(progress?.totals.totalFocusCompletions ?? 0);
  const minutesSummary = formatMinutes(progress?.totals.totalFocusMinutes ?? 0);
  const nextStageSummary = progress?.nextStage
    ? `Lv. ${progress.nextStage.level} · ${formatCount(progress.nextStage.requiredCompletions)} / ${formatMinutes(progress.nextStage.requiredFocusMinutes)}`
    : "최종 단계에 도달했습니다.";

  return (
    <div className="mt-3 space-y-2.5">
      <div className="relative overflow-hidden rounded-[14px] bg-tomato-secondary-start/88 px-4 py-4">
        <div className="relative space-y-3.5">
          <div className="character-stage-shell grid min-h-[148px] place-items-center rounded-[12px] bg-white/90 p-3">
            {progress?.stage.characterImageUrl ? (
              <Image
                key={`stage-${progress.stage.level}`}
                src={progress.stage.characterImageUrl}
                alt={`레벨 ${progress.stage.level} 캐릭터`}
                width={152}
                height={152}
                className="character-stage-image h-auto w-full max-w-[152px] object-contain drop-shadow-[0_14px_20px_rgba(94,54,24,0.16)]"
                priority
              />
            ) : (
              <div className="grid h-[132px] w-full max-w-[152px] place-items-center rounded-[12px] bg-white/88">
                <p className="m-0 text-[14px] font-semibold text-tomato-help">
                  캐릭터 이미지 준비 중
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.02em] text-tomato-meta">
                현재 단계
              </p>
              <p className="m-0 mt-1 text-[20px] font-semibold text-tomato-ink-strong">
                Lv. {progress?.stage.level ?? 1}
              </p>
            </div>
            {isLoading ? (
              <span className="rounded-full bg-white/88 px-3 py-1 text-[12px] font-semibold text-tomato-meta">
                불러오는 중
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-[12px] bg-white/88 px-3.5 py-3">
        <p className="m-0 text-[11px] font-semibold tracking-[0.02em] text-tomato-meta">
          집중 요약
        </p>
        <p className="m-0 mt-1 text-[15px] font-semibold text-tomato-ink-strong">
          완료 {completionSummary} · 누적 {minutesSummary}
        </p>
      </div>

      <details className="rounded-[12px] bg-white/88 px-3.5 py-3">
        <summary className="cursor-pointer list-none text-[11px] font-semibold tracking-[0.02em] text-tomato-meta [&::-webkit-details-marker]:hidden">
          다음 단계 보기
        </summary>
        <p className="m-0 mt-1 text-[14px] leading-6 text-tomato-ink-strong">
          {nextStageSummary}
        </p>
      </details>

      {error ? (
        <p className="m-0 text-[13px] leading-5 text-tomato-error">{error}</p>
      ) : null}
    </div>
  );
};
