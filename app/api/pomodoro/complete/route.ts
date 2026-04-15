import { desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/src/db";
import { pomodoroCompletions, userProgress } from "@/src/db/schema";
import {
  buildProgressSnapshot,
  EMPTY_PROGRESS_TOTALS,
  getCurrentCharacterStage,
} from "@/src/lib/progress";
import type {
  CompletionRequestPayload,
  ProgressTotals,
} from "@/src/types/progress";

const isValidPositiveInteger = (value: unknown): value is number => {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
};

const parsePayload = (value: unknown): CompletionRequestPayload | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Record<string, unknown>;
  const completedAt = payload.completedAt;
  const focusSeconds = payload.focusSeconds;
  const focusMinutes = payload.focusMinutes;

  if (
    typeof completedAt !== "string" ||
    !isValidPositiveInteger(focusSeconds) ||
    !isValidPositiveInteger(focusMinutes)
  ) {
    return null;
  }

  return {
    completedAt,
    focusSeconds,
    focusMinutes,
  };
};

const toTotals = (
  row:
    | {
        totalFocusCompletions: number;
        totalFocusMinutes: number;
      }
    | undefined,
): ProgressTotals => row ?? EMPTY_PROGRESS_TOTALS;

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const payload = parsePayload(rawBody);

  if (!payload) {
    return Response.json({ message: "Invalid payload" }, { status: 400 });
  }

  const completedAt = new Date(payload.completedAt);

  if (Number.isNaN(completedAt.getTime())) {
    return Response.json({ message: "Invalid completedAt" }, { status: 400 });
  }

  const [previousProgressRow] = await db
    .select({
      totalFocusCompletions: userProgress.totalFocusCompletions,
      totalFocusMinutes: userProgress.totalFocusMinutes,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  const previousTotals = toTotals(previousProgressRow);
  const previousLevel = getCurrentCharacterStage(previousTotals).level;

  // 완료 로그를 먼저 저장하고, 동일 완료시각이면 중복 삽입을 무시합니다.
  await db
    .insert(pomodoroCompletions)
    .values({
      userId,
      completedAt,
      focusSeconds: payload.focusSeconds,
      focusMinutes: payload.focusMinutes,
    })
    .onConflictDoNothing({
      target: [pomodoroCompletions.userId, pomodoroCompletions.completedAt],
    });

  const [aggregatedTotalsRow] = await db
    .select({
      totalFocusCompletions: sql<number>`count(*)::int`,
      totalFocusMinutes: sql<number>`coalesce(sum(${pomodoroCompletions.focusMinutes}), 0)::int`,
    })
    .from(pomodoroCompletions)
    .where(eq(pomodoroCompletions.userId, userId))
    .limit(1);

  const [latestCompletionRow] = await db
    .select({
      completedAt: pomodoroCompletions.completedAt,
    })
    .from(pomodoroCompletions)
    .where(eq(pomodoroCompletions.userId, userId))
    .orderBy(desc(pomodoroCompletions.completedAt))
    .limit(1);

  const aggregatedTotals = {
    totalFocusCompletions: aggregatedTotalsRow?.totalFocusCompletions ?? 0,
    totalFocusMinutes: aggregatedTotalsRow?.totalFocusMinutes ?? 0,
  };

  await db
    .insert(userProgress)
    .values({
      userId,
      totalFocusCompletions: aggregatedTotals.totalFocusCompletions,
      totalFocusMinutes: aggregatedTotals.totalFocusMinutes,
      lastCompletedAt: latestCompletionRow?.completedAt ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userProgress.userId,
      set: {
        totalFocusCompletions: aggregatedTotals.totalFocusCompletions,
        totalFocusMinutes: aggregatedTotals.totalFocusMinutes,
        lastCompletedAt: latestCompletionRow?.completedAt ?? null,
        updatedAt: new Date(),
      },
    });

  const [nextProgressRow] = await db
    .select({
      totalFocusCompletions: userProgress.totalFocusCompletions,
      totalFocusMinutes: userProgress.totalFocusMinutes,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  const nextTotals = toTotals(nextProgressRow);
  const snapshot = buildProgressSnapshot(nextTotals);
  const insertedCompletion =
    nextTotals.totalFocusCompletions > previousTotals.totalFocusCompletions;

  return Response.json({
    ...snapshot,
    leveledUp: insertedCompletion && snapshot.stage.level > previousLevel,
  });
}
