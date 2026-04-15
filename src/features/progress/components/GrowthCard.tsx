"use client";

import { GrowthCardAuthenticatedView } from "./GrowthCardAuthenticatedView";
import { GrowthCardGuestView } from "./GrowthCardGuestView";
import type { AuthStatus } from "@/src/types/auth";
import type { ProgressSnapshot } from "@/src/types/progress";

type GrowthCardProps = {
  sessionStatus: AuthStatus;
  progress: ProgressSnapshot | null;
  isLoading: boolean;
  error: string | null;
  userName?: string | null;
  guestCharacterImageUrl: string | null;
};

const numberFormatter = new Intl.NumberFormat("ko-KR");

const formatCount = (value: number) => `${numberFormatter.format(value)}회`;
const formatMinutes = (value: number) => `${numberFormatter.format(value)}분`;

const actionButtonClass =
  "cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold leading-none transition-[transform,box-shadow,background] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] active:translate-y-0";

export const GrowthCard = ({
  sessionStatus,
  progress,
  isLoading,
  error,
  userName,
  guestCharacterImageUrl,
}: GrowthCardProps) => {
  const isAuthenticated = sessionStatus === "authenticated";
  const previewCharacterImageUrl = guestCharacterImageUrl ?? "/LOGO.png";

  return (
    <section className="rounded-[22px] border border-tomato-border-soft bg-[var(--color-surface-quiet)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="space-y-1">
          <p className="m-0 text-[11px] font-semibold tracking-[0.04em] text-tomato-meta">
            CHARACTER GROWTH
          </p>
          <h2 className="m-0 text-[17px] font-semibold text-tomato-ink-strong">
            캐릭터 성장
          </h2>
        </div>
        {isAuthenticated && userName ? (
          <p className="m-0 text-right text-[12px] leading-5 text-tomato-meta">
            {userName}
          </p>
        ) : null}
      </div>

      {isAuthenticated ? (
        <GrowthCardAuthenticatedView
          progress={progress}
          isLoading={isLoading}
          error={error}
          actionButtonClass={actionButtonClass}
          formatCount={formatCount}
          formatMinutes={formatMinutes}
        />
      ) : (
        <GrowthCardGuestView previewCharacterImageUrl={previewCharacterImageUrl} />
      )}
    </section>
  );
};
