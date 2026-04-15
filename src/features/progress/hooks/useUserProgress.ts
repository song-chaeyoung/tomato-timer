"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { AuthStatus } from "@/src/types/auth";
import type {
  CompletionResponse,
  ProgressSnapshot,
} from "@/src/types/progress";

type UseUserProgressOptions = {
  sessionStatus: AuthStatus;
};

type RecordFocusCompletionInput = {
  completedAt: number;
  focusSeconds: number;
  focusMinutes: number;
};

const normalizeProgressSnapshot = (
  snapshot: ProgressSnapshot | CompletionResponse,
): ProgressSnapshot => ({
  totals: snapshot.totals,
  stage: snapshot.stage,
  nextStage: snapshot.nextStage,
});

export const useUserProgress = ({
  sessionStatus,
}: UseUserProgressOptions) => {
  const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyProgressSnapshot = useCallback(
    (snapshot: ProgressSnapshot | CompletionResponse) => {
      startTransition(() => {
        setProgress(normalizeProgressSnapshot(snapshot));
        setError(null);
      });
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (sessionStatus !== "authenticated") {
      startTransition(() => {
        setProgress(null);
        setError(null);
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/me/progress", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load progress: ${response.status}`);
      }

      const data: ProgressSnapshot = await response.json();
      applyProgressSnapshot(data);
    } catch (refreshError) {
      console.error(refreshError);
      startTransition(() => {
        setError("성장 기록을 불러오지 못했습니다.");
      });
    } finally {
      setIsLoading(false);
    }
  }, [applyProgressSnapshot, sessionStatus]);

  const recordFocusCompletion = useCallback(
    async ({
      completedAt,
      focusSeconds,
      focusMinutes,
    }: RecordFocusCompletionInput) => {
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
            focusSeconds,
            focusMinutes,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to persist completion: ${response.status}`);
        }

        const data: CompletionResponse = await response.json();
        applyProgressSnapshot(data);
      } catch (persistError) {
        console.error(persistError);
        startTransition(() => {
          setError("집중 완료 기록을 저장하지 못했습니다.");
        });
      }
    },
    [applyProgressSnapshot, sessionStatus],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    progress,
    isLoading,
    error,
    refresh,
    recordFocusCompletion,
  };
};
