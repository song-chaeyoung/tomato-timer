import { useCallback, useEffect, useMemo, useRef } from "react";
import { getPhaseDurationSeconds, PHASE_LABEL, TIMER_STORAGE_KEY } from "@/src/constants/timer";
import { usePipBridge } from "@/src/features/timer/hooks/usePipBridge";
import { useTimerWorker } from "@/src/features/timer/hooks/useTimerWorker";
import { playCompletionTone } from "@/src/features/timer/utils/audio";
import {
  readStoredSnapshot,
  restoreSnapshot,
} from "@/src/features/timer/utils/snapshot";
import { buildSnapshot } from "@/src/store/timerStore";
import type {
  TimerPhase,
  TimerSettings,
  TimerSnapshot,
  TimerStatus,
} from "@/src/types/timer";

type HomeTimerControllerOptions = {
  phase: TimerPhase;
  focusCountInSet: number;
  settings: TimerSettings;
  status: TimerStatus;
  remainingSeconds: number;
  lastUpdatedAt: number;
  setStatus: (status: TimerStatus) => void;
  resetAll: () => TimerSnapshot;
  applySettings: (nextSettings: Partial<TimerSettings>) => void;
  hydrate: (snapshot: TimerSnapshot) => void;
  advancePhaseAfterCompletion: (at?: number) => TimerSnapshot;
  onFocusCompleted: (
    completedAt: number,
    completedSettings: TimerSettings,
  ) => void | Promise<void>;
};

export const useHomeTimerController = ({
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
  onFocusCompleted,
}: HomeTimerControllerOptions) => {
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
        body: `${PHASE_LABEL[completedPhase]} 단계가 완료되었어요.`,
      });
    }

    playCompletionTone();
  }, []);

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
        void onFocusCompleted(at, completedSnapshotBase.settings);
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

  return {
    pipSupported,
    pipError,
    runPrimaryAction,
    resetTimer,
    handleOpenPipWindow,
    handleSettingsChange,
  };
};
