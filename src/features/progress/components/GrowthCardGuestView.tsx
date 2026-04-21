"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type GrowthCardGuestViewProps = {
  previewCharacterImageUrl: string;
};

export const GrowthCardGuestView = ({
  previewCharacterImageUrl,
}: GrowthCardGuestViewProps) => {
  return (
    <Dialog>
      <div className="mt-3">
        <DialogTrigger asChild>
          <button
            type="button"
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[14px] border border-tomato-border-soft/55 bg-[var(--color-tomato-panel-elevated)] px-4 py-4 text-left transition-[transform,box-shadow] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] focus-visible:outline-none"
          >
            <div className="character-stage-shell relative grid h-[108px] w-[108px] shrink-0 place-items-center rounded-[12px] bg-[var(--color-character-stage-surface)] p-3">
              <Image
                src={previewCharacterImageUrl}
                alt="기본 캐릭터 미리보기"
                width={112}
                height={112}
                className="character-stage-image h-auto w-full max-w-[96px] object-contain drop-shadow-[0_12px_18px_rgba(94,54,24,0.14)]"
                priority
              />
            </div>

            <div className="relative min-w-0 space-y-2">
              <p className="m-0 text-[11px] font-semibold tracking-[0.02em] text-tomato-meta">
                미리보기
              </p>
              <p className="m-0 text-[16px] font-semibold text-tomato-ink-strong">
                기본 캐릭터부터 시작
              </p>
              <p className="m-0 text-[13px] leading-5 text-tomato-help">
                성장 기록을 이어서 관리하려면 로그인해 주세요.
              </p>
            </div>
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-[372px] overflow-hidden rounded-[18px] border border-tomato-border/70 bg-tomato-card p-0 text-tomato-ink shadow-[var(--shadow-shell)]">
        <div className="relative overflow-hidden px-5 pb-4 pt-5">
          <div className="relative space-y-4">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-[18px] font-semibold text-tomato-ink-strong">
                로그인하고 성장 기록을 이어가세요
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-5 text-tomato-help">
                집중 완료 기록을 저장하고, 누적 성과에 따라 캐릭터가 단계별로
                성장합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="character-stage-shell grid min-h-[156px] place-items-center rounded-[12px] bg-[var(--color-character-stage-surface)] p-4">
              <Image
                src={previewCharacterImageUrl}
                alt="기본 캐릭터"
                width={148}
                height={148}
                className="character-stage-image h-auto w-full max-w-[148px] object-contain drop-shadow-[0_16px_24px_rgba(94,54,24,0.16)]"
                priority
              />
            </div>

            <div className="rounded-[12px] border border-tomato-border-soft/45 bg-[var(--color-tomato-panel-soft)] px-4 py-3">
              <p className="m-0 text-[13px] leading-6 text-tomato-ink-strong">
                로그인 후에는 완료 횟수와 누적 집중 시간이 저장되고, 다음 단계
                조건도 바로 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-tomato-border-soft/45 bg-[var(--color-tomato-panel-soft)] px-5 py-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 min-w-[88px] rounded-xl border-tomato-border-soft bg-[var(--color-tomato-button-soft)] px-4 text-tomato-ink-strong hover:bg-[var(--color-tomato-panel-elevated)]"
            >
              나중에
            </Button>
          </DialogClose>
          <Button
            className="h-11 min-w-[164px] rounded-xl border-transparent bg-[var(--color-tomato-accent)] px-5 text-white shadow-[0_8px_16px_rgba(126,65,31,0.22)] hover:brightness-95"
            onClick={() => void signIn("google", { callbackUrl: "/" })}
          >
            Google로 로그인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
