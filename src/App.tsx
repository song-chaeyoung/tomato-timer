import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  getPhaseDurationSeconds,
  PHASE_LABEL,
  TIMER_STORAGE_KEY,
} from "./constants/timer";
import { buildSnapshot, useTimerStore } from "./store/timerStore";
import type { TimerPhase, TimerSettings } from "./types/timer";
import { TimerControls } from "./features/timer/components/TimerControls";
import { TimerDial } from "./features/timer/components/TimerDial";
import { TimerSettingsPanel } from "./features/timer/components/TimerSettingsPanel";
import { usePipBridge } from "./features/timer/hooks/usePipBridge";
import { useTimerWorker } from "./features/timer/hooks/useTimerWorker";
import { playCompletionTone } from "./features/timer/utils/audio";
import {
  readStoredSnapshot,
  restoreSnapshot,
} from "./features/timer/utils/snapshot";

function App() {
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
        body: `${PHASE_LABEL[completedPhase]} ?④퀎媛 ?꾨즺?먯뼱??`,
      });
    }

    playCompletionTone();
  }, []);

  const workerControls = useTimerWorker({
    getCurrentSnapshotBase: () => snapshotBaseRef.current,
    onSnapshot: hydrate,
    onCompleted: (completedPhase, at) => {
      const nextSnapshot = advancePhaseAfterCompletion(at);
      snapshotBaseRef.current = {
        phase: nextSnapshot.phase,
        focusCountInSet: nextSnapshot.focusCountInSet,
        settings: nextSnapshot.settings,
      };
      notifyCompleted(completedPhase);
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
      "??대㉧瑜?珥덇린 ?곹깭(吏묒쨷 1?뚯감, 湲곕낯 ?ㅼ젙)濡?由ъ뀑?좉퉴??",
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
    <main className="relative isolate flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6">
      <section className="tomato-shell-enter relative w-full max-w-[980px] overflow-hidden rounded-[34px] border border-tomato-border/85 bg-tomato-card/88 p-[clamp(18px,3.6vw,34px)] shadow-[0_24px_52px_rgba(112,57,19,0.17),0_3px_12px_rgba(112,57,19,0.08)] backdrop-blur-md">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-tomato-accent/18 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[var(--color-leaf-accent)]/18 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(310px,360px)] lg:items-end lg:gap-7">
          <div className="space-y-[18px]">
            <header className="flex items-start gap-3 text-left">
              <Image
                src="/LOGO.png"
                alt="?좊쭏??罹먮┃??濡쒓퀬"
                width={56}
                height={56}
                className="tomato-logo h-14 w-14 shrink-0 rounded-[12px] border border-tomato-border-soft/75 bg-white/72 object-cover p-[3px] shadow-[0_5px_14px_rgba(112,57,19,0.1)]"
              />
              <div className="min-w-0 space-y-1">
                <p className="m-0 text-[11px] font-semibold tracking-[0.04em] text-tomato-meta">
                  SOFT RETRO PIXEL
                </p>
                <h1 className="tomato-title m-0 font-display text-[clamp(34px,7vw,58px)] text-tomato-title">
                  戮紐⑤룄濡???대㉧
                </h1>
                <p className="m-0 text-[13px] leading-5 text-tomato-help">
                  湲?吏묒쨷 ?몄뀡怨?吏㏃? ?낅Т ?ㅽ봽由고듃瑜?媛숈? 由щ벉?쇰줈 ?좎???                  蹂댁꽭??
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
              pipSupported={pipSupported}
              onRunPrimaryAction={runPrimaryAction}
              onResetTimer={resetTimer}
              onOpenPipWindow={handleOpenPipWindow}
            />

            <TimerSettingsPanel
              settings={settings}
              disabled={status !== "idle"}
              onChangeSettings={handleSettingsChange}
            />

            <div className="space-y-1.5">
              {!pipSupported && (
                <p className="mb-0 text-[13px] leading-5 text-tomato-help">
                  ?꾩옱 釉뚮씪?곗???Document PiP瑜?吏?먰븯吏 ?딆븘 硫붿씤 ??대㉧留?                  ?숈옉?⑸땲??
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

export default App;

