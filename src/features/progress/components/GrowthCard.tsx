"use client";

import { signOut } from "next-auth/react";
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
    <section className="pixel-corners rounded-[14px] border border-tomato-border-soft/55 bg-[var(--color-tomato-panel-soft)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="space-y-1">
          <p className="m-0 text-[11px] font-semibold tracking-[0.02em] text-tomato-meta">
            성장 추적
          </p>
          <h2 className="m-0 text-[17px] font-semibold text-tomato-ink-strong">
            캐릭터 성장
          </h2>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {userName ? (
              <p className="m-0 text-right text-[12px] leading-5 text-tomato-meta">
                {userName}
              </p>
            ) : null}
            <button
              type="button"
              className="cursor-pointer rounded-md px-2 py-1 text-[12px] font-semibold leading-none text-tomato-help transition-colors hover:bg-[var(--color-tomato-button-soft)] hover:text-tomato-ink-strong"
              onClick={() => void signOut({ callbackUrl: "/" })}
            >
              로그아웃
            </button>
          </div>
        ) : null}
      </div>

      {isAuthenticated ? (
        <GrowthCardAuthenticatedView
          progress={progress}
          isLoading={isLoading}
          error={error}
          formatCount={formatCount}
          formatMinutes={formatMinutes}
        />
      ) : (
        <GrowthCardGuestView previewCharacterImageUrl={previewCharacterImageUrl} />
      )}
    </section>
  );
};
