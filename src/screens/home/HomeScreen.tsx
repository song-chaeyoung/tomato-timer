import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
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

  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center px-4 py-4 sm:px-6 sm:py-5">
      <section className="tomato-shell-enter relative w-full max-w-[980px] overflow-hidden rounded-[34px] border border-tomato-border/85 bg-tomato-card/88 p-[clamp(16px,3vw,28px)] shadow-[0_24px_52px_rgba(112,57,19,0.17),0_3px_12px_rgba(112,57,19,0.08)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-tomato-accent/18 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[var(--color-leaf-accent)]/18 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(310px,360px)] lg:items-start lg:gap-6">
          <div className="space-y-4">
            <header className="flex items-start gap-3 text-left">
              <Image
                src="/LOGO.png"
                alt="토마토 타이머 로고"
                width={56}
                height={56}
                className="tomato-logo h-14 w-14 shrink-0 rounded-[12px] border border-tomato-border-soft/75 bg-white/72 object-cover p-[3px] shadow-[0_5px_14px_rgba(112,57,19,0.1)]"
              />
              <div className="min-w-0 space-y-1">
                <p className="m-0 text-[11px] font-semibold tracking-[0.04em] text-tomato-meta">
                  SOFT RETRO PIXEL
                </p>
                <h1 className="tomato-title m-0 font-display text-[clamp(34px,7vw,58px)] text-tomato-title">
                  뽀모도로 타이머
                </h1>
                <p className="m-0 text-[13px] leading-5 text-tomato-help">
                  집중 세션과 짧은 회복 리듬을 한 화면에서 관리해 보세요.
                </p>
              </div>
            </header>

            <TimerDial
              phase={phase}
              focusCountInSet={focusCountInSet}
              settings={settings}
              status={status}
              remainingSeconds={remainingSeconds}
            />
          </div>

          <div className="space-y-3.5">
            <TimerControls
              status={status}
              pipSupported={Boolean(pipSupported)}
              onRunPrimaryAction={runPrimaryAction}
              onResetTimer={resetTimer}
              onOpenPipWindow={handleOpenPipWindow}
            />

            <GrowthCard
              sessionStatus={sessionStatus}
              progress={progress}
              isLoading={isProgressLoading}
              error={progressError}
              userName={session?.user?.name}
              guestCharacterImageUrl={guestCharacterImageUrl}
            />

            <TimerSettingsPanel
              settings={settings}
              disabled={status !== "idle"}
              onChangeSettings={handleSettingsChange}
            />

            <div className="space-y-1.5">
              {pipSupported === false && (
                <p className="mb-0 text-[13px] leading-5 text-tomato-help">
                  현재 브라우저에서는 Document PiP를 지원하지 않아 메인 타이머만
                  사용할 수 있습니다.
                </p>
              )}

              {pipError && (
                <p className="mb-0 text-[13px] font-medium leading-5 text-tomato-error">
                  {pipError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomeScreen;
