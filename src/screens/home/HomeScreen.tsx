import Image from "next/image";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  getPhaseDurationSeconds,
  PHASE_LABEL,
  TIMER_STORAGE_KEY,
} from "@/src/constants/timer";
import { GrowthCard } from "@/src/features/progress/components/GrowthCard";
import { useUserProgress } from "@/src/features/progress/hooks/useUserProgress";
import { TimerControls } from "@/src/features/timer/components/TimerControls";
import { TimerDial } from "@/src/features/timer/components/TimerDial";
import { TimerSettingsPanel } from "@/src/features/timer/components/TimerSettingsPanel";
import { usePipBridge } from "@/src/features/timer/hooks/usePipBridge";
import { useTimerWorker } from "@/src/features/timer/hooks/useTimerWorker";
import { playCompletionTone } from "@/src/features/timer/utils/audio";
import {
  readStoredSnapshot,
  restoreSnapshot,
} from "@/src/features/timer/utils/snapshot";
import { buildSnapshot, useTimerStore } from "@/src/store/timerStore";
import type { CompletionResponse } from "@/src/types/progress";
import type { TimerPhase, TimerSettings } from "@/src/types/timer";

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

  const snapshotBaseRef = useRef({
    phase,
    focusCountInSet,
    settings,
  });
  const hasHydratedRef = useRef(false);
  const [progressMutationError, setProgressMutationError] = useState<
    string | null
  >(null);
  const {
    progress,
    isLoading: isProgressLoading,
    error: progressLoadError,
    applyProgressSnapshot,
  } = useUserProgress({ sessionStatus });

  const snapshot = useMemo(
    () =>
      buildSnapshot(
        phase,
        focusCountInSet,
        settings,
        status,
        remainingSeconds,
        lastUpdatedAt,
      ),
    [focusCountInSet, lastUpdatedAt, phase, remainingSeconds, settings, status],
  );

  const ensureNotificationPermission = useCallback(() => {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const notifyCompleted = useCallback((completedPhase: TimerPhase) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Tomato!", {
        body: `${PHASE_LABEL[completedPhase]} 단계가 완료되었어요.`,
      });
    }

    playCompletionTone();
  }, []);

  const persistFocusCompletion = useCallback(
    async (completedAt: number, completedSettings: TimerSettings) => {
      if (sessionStatus !== "authenticated") {
        return;
      }

      try {
        const response = await fetch("/api/pomodoro/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completedAt: new Date(completedAt).toISOString(),
            focusSeconds: getPhaseDurationSeconds("focus", completedSettings),
            focusMinutes: completedSettings.focusMinutes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to persist completion: ${response.status}`);
        }

        const data: CompletionResponse = await response.json();
        applyProgressSnapshot(data);
        setProgressMutationError(null);
      } catch (persistError) {
        console.error(persistError);
        setProgressMutationError("집중 완료 기록을 저장하지 못했습니다.");
      }
    },
    [applyProgressSnapshot, sessionStatus],
  );

  const workerControls = useTimerWorker({
    getCurrentSnapshotBase: () => snapshotBaseRef.current,
    onSnapshot: hydrate,
    onCompleted: (completedPhase, at) => {
      const completedSnapshotBase = snapshotBaseRef.current;
      const nextSnapshot = advancePhaseAfterCompletion(at);
      snapshotBaseRef.current = {
        phase: nextSnapshot.phase,
        focusCountInSet: nextSnapshot.focusCountInSet,
        settings: nextSnapshot.settings,
      };
      notifyCompleted(completedPhase);

      if (completedPhase === "focus") {
        void persistFocusCompletion(at, completedSnapshotBase.settings);
      }
    },
  });

  const startTimerWithoutPip = useCallback(() => {
    const baseSeconds =
      remainingSeconds > 0
        ? remainingSeconds
        : getPhaseDurationSeconds(phase, settings);

    setStatus("running");
    workerControls.start(baseSeconds);
    ensureNotificationPermission();
  }, [
    ensureNotificationPermission,
    phase,
    remainingSeconds,
    setStatus,
    settings,
    workerControls,
  ]);

  const pauseTimer = useCallback(() => {
    setStatus("paused");
    workerControls.pause();
  }, [setStatus, workerControls]);

  const resumeTimer = useCallback(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    setStatus("running");
    workerControls.resume();
    ensureNotificationPermission();
  }, [
    ensureNotificationPermission,
    remainingSeconds,
    setStatus,
    workerControls,
  ]);

  const resetTimer = useCallback(() => {
    const shouldReset = window.confirm(
      "타이머를 초기 상태(집중 1회차, 기본 설정)로 되돌릴까요?",
    );

    if (!shouldReset) {
      return;
    }

    const nextSnapshot = resetAll();
    snapshotBaseRef.current = {
      phase: nextSnapshot.phase,
      focusCountInSet: nextSnapshot.focusCountInSet,
      settings: nextSnapshot.settings,
    };
    workerControls.reset(nextSnapshot.remainingSeconds);
  }, [resetAll, workerControls]);

  const { pipSupported, pipError, openPipWindow } = usePipBridge({
    snapshot,
    onStart: startTimerWithoutPip,
    onPause: pauseTimer,
    onResume: resumeTimer,
    onReset: resetTimer,
  });

  const startTimer = useCallback(() => {
    startTimerWithoutPip();
    void openPipWindow();
  }, [openPipWindow, startTimerWithoutPip]);

  const runPrimaryAction = useCallback(() => {
    if (status === "running") {
      pauseTimer();
      return;
    }

    if (status === "paused") {
      resumeTimer();
      return;
    }

    startTimer();
  }, [pauseTimer, resumeTimer, startTimer, status]);

  const handleSettingsChange = useCallback(
    (nextSettings: Partial<TimerSettings>) => {
      if (status !== "idle") {
        return;
      }

      applySettings(nextSettings);
    },
    [applySettings, status],
  );

  useEffect(() => {
    snapshotBaseRef.current = {
      phase,
      focusCountInSet,
      settings,
    };
  }, [focusCountInSet, phase, settings]);

  useEffect(() => {
    if (sessionStatus !== "authenticated") {
      setProgressMutationError(null);
    }
  }, [sessionStatus]);

  useEffect(() => {
    const stored = readStoredSnapshot();
    if (stored) {
      const restored = restoreSnapshot(stored);
      snapshotBaseRef.current = {
        phase: restored.phase,
        focusCountInSet: restored.focusCountInSet,
        settings: restored.settings,
      };
      hydrate(restored);

      if (restored.status === "running") {
        workerControls.sync(restored.status, restored.remainingSeconds);
      }
    }

    queueMicrotask(() => {
      hasHydratedRef.current = true;
    });
  }, [hydrate, workerControls]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return;
    }

    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(snapshot));
  }, [snapshot]);

  const handleOpenPipWindow = useCallback(() => {
    void openPipWindow();
  }, [openPipWindow]);

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
              error={progressMutationError ?? progressLoadError}
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
