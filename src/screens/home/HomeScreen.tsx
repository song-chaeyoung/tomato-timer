import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { getPhaseDurationSeconds } from "@/src/constants/timer";
import { GrowthCard } from "@/src/features/progress/components/GrowthCard";
import { useUserProgress } from "@/src/features/progress/hooks/useUserProgress";
import { TimerControls } from "@/src/features/timer/components/TimerControls";
import { TimerDial } from "@/src/features/timer/components/TimerDial";
import { TimerSettingsPanel } from "@/src/features/timer/components/TimerSettingsPanel";
import { useTimerStore } from "@/src/store/timerStore";
import type { TimerSettings } from "@/src/types/timer";
import { useHomeTimerController } from "./hooks/useHomeTimerController";

type HomeScreenProps = {
  guestCharacterImageUrl: string | null;
};

function HomeScreen({ guestCharacterImageUrl }: HomeScreenProps) {
  const { data: session, status: sessionStatus } = useSession();
  const {
    phase,
    focusCountInSet,
    settings,
    status,
    remainingSeconds,
    lastUpdatedAt,
    setStatus,
    resetAll,
    applySettings,
    hydrate,
    advancePhaseAfterCompletion,
  } = useTimerStore(
    useShallow((state) => ({
      phase: state.phase,
      focusCountInSet: state.focusCountInSet,
      settings: state.settings,
      status: state.status,
      remainingSeconds: state.remainingSeconds,
      lastUpdatedAt: state.lastUpdatedAt,
      setStatus: state.setStatus,
      resetAll: state.resetAll,
      applySettings: state.applySettings,
      hydrate: state.hydrate,
      advancePhaseAfterCompletion: state.advancePhaseAfterCompletion,
    })),
  );

  const {
    progress,
    isLoading: isProgressLoading,
    error: progressError,
    recordFocusCompletion,
  } = useUserProgress({ sessionStatus });

  const handleFocusCompleted = useCallback(
    async (completedAt: number, completedSettings: TimerSettings) => {
      await recordFocusCompletion({
        completedAt,
        focusSeconds: getPhaseDurationSeconds("focus", completedSettings),
        focusMinutes: completedSettings.focusMinutes,
      });
    },
    [recordFocusCompletion],
  );

  const {
    pipSupported,
    pipError,
    runPrimaryAction,
    resetTimer,
    handleOpenPipWindow,
    handleSettingsChange,
  } = useHomeTimerController({
    phase,
    focusCountInSet,
    settings,
    status,
    remainingSeconds,
    lastUpdatedAt,
    setStatus,
    resetAll,
    applySettings,
    hydrate,
    advancePhaseAfterCompletion,
    onFocusCompleted: handleFocusCompleted,
  });

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center px-4 py-3 sm:px-5 sm:py-4">
      <section className="tomato-shell-enter relative h-fit w-full max-w-[1080px] overflow-hidden rounded-[24px] border border-tomato-border/80 bg-tomato-card p-[clamp(14px,2vw,22px)] shadow-[0_20px_36px_rgba(99,74,50,0.09),0_2px_6px_rgba(99,74,50,0.06)]">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-tomato-accent/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[var(--color-leaf-accent)]/8 blur-3xl"
          aria-hidden="true"
        />

        <header className="relative flex items-start gap-3.5 text-left">
          <Image
            src="/LOGO.png"
            alt="토마토 타이머 로고"
            width={50}
            height={50}
            className="tomato-logo h-[50px] w-[50px] shrink-0 rounded-[11px] border border-tomato-border-soft/70 bg-white/80 object-cover p-[2px]"
          />
          <div className="min-w-0 space-y-1">
            <p className="m-0 text-[11px] font-semibold tracking-[0.02em] text-tomato-meta">
              포커스 루틴 타이머
            </p>
            <h1 className="tomato-title m-0 font-display text-[clamp(30px,5.6vw,48px)] text-tomato-title">
              뽀모도로 타이머
            </h1>
            <p className="m-0 text-[13px] leading-5 text-tomato-help">
              한 화면에서 시작하고, 멈추고, 다시 집중하세요.
            </p>
          </div>
        </header>

        <div className="relative mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)] lg:items-stretch lg:gap-5">
          <TimerDial
            phase={phase}
            focusCountInSet={focusCountInSet}
            settings={settings}
            status={status}
            remainingSeconds={remainingSeconds}
          />

          <section className="flex h-full flex-col gap-3.5 rounded-[18px] border border-tomato-border-soft/45 bg-white/72 p-3.5 sm:p-4">
            <TimerControls
              status={status}
              pipSupported={Boolean(pipSupported)}
              onRunPrimaryAction={runPrimaryAction}
              onResetTimer={resetTimer}
              onOpenPipWindow={handleOpenPipWindow}
            />

            <button
              type="button"
              className="cursor-pointer rounded-xl border border-tomato-border-soft bg-white/70 px-4 py-3 text-sm font-semibold text-tomato-ink-strong transition-[transform,box-shadow,background-color,border-color] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[1px] hover:border-tomato-border hover:bg-white/90 active:translate-y-0"
              onClick={() => {
                setIsSettingsDialogOpen(true);
              }}
            >
              세트 설정
            </button>

            <GrowthCard
              sessionStatus={sessionStatus}
              progress={progress}
              isLoading={isProgressLoading}
              error={progressError}
              userName={session?.user?.name}
              guestCharacterImageUrl={guestCharacterImageUrl}
            />

            <TimerSettingsPanel
              open={isSettingsDialogOpen}
              onOpenChange={setIsSettingsDialogOpen}
              settings={settings}
              disabled={status !== "idle"}
              onSave={handleSettingsChange}
            />

            <div className="space-y-1">
              {pipSupported === false && (
                <p className="mb-0 text-[13px] leading-5 text-tomato-help">
                  현재 브라우저에서는 작은 PiP 창을 지원하지 않습니다.
                </p>
              )}

              {pipError && (
                <p className="mb-0 text-[13px] font-medium leading-5 text-tomato-error">
                  {pipError}
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default HomeScreen;
