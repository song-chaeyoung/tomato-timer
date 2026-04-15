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
            className="relative flex w-full items-center gap-3 overflow-hidden rounded-[24px] border border-tomato-border-soft/80 bg-[linear-gradient(160deg,rgba(255,247,237,0.95),rgba(250,236,219,0.92))] px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] hover:border-tomato-border focus-visible:outline-none"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-tomato-accent/16 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-[var(--color-leaf-accent)]/14 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid h-[108px] w-[108px] shrink-0 place-items-center rounded-[22px] border border-white/75 bg-white/58 p-3">
              <Image
                src={previewCharacterImageUrl}
                alt="기본 캐릭터 미리보기"
                width={112}
                height={112}
                className="h-auto w-full max-w-[96px] object-contain drop-shadow-[0_12px_18px_rgba(94,54,24,0.14)]"
                priority
              />
            </div>

            <div className="relative min-w-0 space-y-2">
              <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-tomato-meta">
                STAGE PREVIEW
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

      <DialogContent className="max-w-[372px] overflow-hidden rounded-[28px] border border-tomato-border/85 bg-[linear-gradient(180deg,rgba(255,250,242,0.98),rgba(253,246,238,0.98))] p-0 text-tomato-ink shadow-[0_24px_52px_rgba(112,57,19,0.17),0_3px_12px_rgba(112,57,19,0.08)]">
        <div className="relative overflow-hidden px-5 pb-4 pt-5">
          <div
            className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-tomato-accent/14 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-[var(--color-leaf-accent)]/10 blur-3xl"
            aria-hidden="true"
          />

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

            <div className="grid min-h-[156px] place-items-center rounded-[24px] border border-white/75 bg-white/58 p-4">
              <Image
                src={previewCharacterImageUrl}
                alt="기본 캐릭터"
                width={148}
                height={148}
                className="h-auto w-full max-w-[148px] object-contain drop-shadow-[0_16px_24px_rgba(94,54,24,0.16)]"
                priority
              />
            </div>

            <div className="rounded-[18px] border border-tomato-border-soft/80 bg-white/62 px-4 py-3">
              <p className="m-0 text-[13px] leading-6 text-tomato-ink-strong">
                로그인 후에는 완료 횟수와 누적 집중 시간이 저장되고, 다음 단계
                조건도 바로 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-tomato-border-soft/70 bg-white/52 px-5 py-4">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 min-w-[88px] rounded-2xl border-tomato-border-soft bg-white/82 px-4 text-tomato-ink-strong hover:bg-white"
            >
              나중에
            </Button>
          </DialogClose>
          <Button
            className="h-11 min-w-[164px] rounded-2xl border-transparent bg-gradient-to-b from-tomato-primary-start to-tomato-primary-end px-5 text-white shadow-[0_10px_20px_rgba(144,61,18,0.26)] hover:brightness-[1.02]"
            onClick={() => void signIn("google", { callbackUrl: "/" })}
          >
            Google로 로그인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
