"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import type { ProgressSnapshot } from "@/src/types/progress";

type GrowthCardAuthenticatedViewProps = {
  progress: ProgressSnapshot | null;
  isLoading: boolean;
  error: string | null;
  actionButtonClass: string;
  formatCount: (value: number) => string;
  formatMinutes: (value: number) => string;
};

export const GrowthCardAuthenticatedView = ({
  progress,
  isLoading,
  error,
  actionButtonClass,
  formatCount,
  formatMinutes,
}: GrowthCardAuthenticatedViewProps) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="relative overflow-hidden rounded-[26px] border border-tomato-border-soft/80 bg-[linear-gradient(160deg,rgba(255,250,242,0.96),rgba(250,236,219,0.92))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
        <div
          className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-tomato-accent/18 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[var(--color-leaf-accent)]/12 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative space-y-4">
          <div className="grid min-h-[176px] place-items-center rounded-[24px] border border-white/70 bg-white/48 p-4">
            {progress?.stage.characterImageUrl ? (
              <Image
                src={progress.stage.characterImageUrl}
                alt={`레벨 ${progress.stage.level} 캐릭터`}
                width={184}
                height={184}
                className="h-auto w-full max-w-[184px] object-contain drop-shadow-[0_18px_30px_rgba(94,54,24,0.18)]"
                priority
              />
            ) : (
              <div className="grid h-[152px] w-full max-w-[184px] place-items-center rounded-[24px] border border-dashed border-tomato-border bg-white/55">
                <p className="m-0 text-[14px] font-semibold text-tomato-help">
                  캐릭터 이미지 준비 중
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-tomato-meta">
                CURRENT STAGE
              </p>
              <p className="m-0 mt-1 text-[20px] font-semibold text-tomato-ink-strong">
                Lv. {progress?.stage.level ?? 1}
              </p>
            </div>
            {isLoading ? (
              <span className="rounded-full border border-tomato-border bg-white/70 px-3 py-1 text-[12px] font-semibold text-tomato-meta">
                불러오는 중
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[18px] border border-tomato-border-soft/80 bg-white/62 p-3.5">
          <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-tomato-meta">
            완료 횟수
          </p>
          <p className="m-0 mt-2 text-[18px] font-semibold text-tomato-ink-strong">
            {formatCount(progress?.totals.totalFocusCompletions ?? 0)}
          </p>
        </div>
        <div className="rounded-[18px] border border-tomato-border-soft/80 bg-white/62 p-3.5">
          <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-tomato-meta">
            누적 집중 시간
          </p>
          <p className="m-0 mt-2 text-[18px] font-semibold text-tomato-ink-strong">
            {formatMinutes(progress?.totals.totalFocusMinutes ?? 0)}
          </p>
        </div>
      </div>

      <div className="rounded-[18px] border border-tomato-border-soft/80 bg-white/62 p-3.5">
        <p className="m-0 text-[11px] font-semibold tracking-[0.06em] text-tomato-meta">
          다음 단계
        </p>
        <p className="m-0 mt-2 text-[14px] leading-6 text-tomato-ink-strong">
          {progress?.nextStage
            ? `Lv. ${progress.nextStage.level} · ${formatCount(progress.nextStage.requiredCompletions)} / ${formatMinutes(progress.nextStage.requiredFocusMinutes)}`
            : "최종 단계에 도달했습니다."}
        </p>
      </div>

      {error ? (
        <p className="m-0 text-[13px] leading-5 text-tomato-error">{error}</p>
      ) : null}

      <button
        type="button"
        className={`${actionButtonClass} w-full border-tomato-border bg-gradient-to-b from-tomato-secondary-start to-tomato-secondary-end text-tomato-ink-strong shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]`}
        onClick={() => void signOut({ callbackUrl: "/" })}
      >
        로그아웃
      </button>
    </div>
  );
};
