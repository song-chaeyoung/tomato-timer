import { eq, sql } from "drizzle-orm";
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

  let insertedCompletion = false;

  const nextProgressRow = await db.transaction(async (tx) => {
    const insertedRows = await tx
      .insert(pomodoroCompletions)
      .values({
        userId,
        completedAt,
        focusSeconds: payload.focusSeconds,
        focusMinutes: payload.focusMinutes,
      })
      .onConflictDoNothing()
      .returning({ id: pomodoroCompletions.id });

    if (!insertedRows.length) {
      const [existingProgressRow] = await tx
        .select({
          totalFocusCompletions: userProgress.totalFocusCompletions,
          totalFocusMinutes: userProgress.totalFocusMinutes,
        })
        .from(userProgress)
        .where(eq(userProgress.userId, userId))
        .limit(1);

      return existingProgressRow;
    }

    insertedCompletion = true;

    const [upsertedProgressRow] = await tx
      .insert(userProgress)
      .values({
        userId,
        totalFocusCompletions: 1,
        totalFocusMinutes: payload.focusMinutes,
        lastCompletedAt: completedAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProgress.userId,
        set: {
          totalFocusCompletions: sql`${userProgress.totalFocusCompletions} + 1`,
          totalFocusMinutes: sql`${userProgress.totalFocusMinutes} + ${payload.focusMinutes}`,
          lastCompletedAt: completedAt,
          updatedAt: new Date(),
        },
      })
      .returning({
        totalFocusCompletions: userProgress.totalFocusCompletions,
        totalFocusMinutes: userProgress.totalFocusMinutes,
      });

    return upsertedProgressRow;
  });

  const nextTotals = toTotals(nextProgressRow);
  const snapshot = buildProgressSnapshot(nextTotals);

  return Response.json({
    ...snapshot,
    leveledUp: insertedCompletion && snapshot.stage.level > previousLevel,
  });
}
