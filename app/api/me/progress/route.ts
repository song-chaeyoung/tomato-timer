import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/src/db";
import { userProgress } from "@/src/db/schema";
import {
  buildProgressSnapshot,
  EMPTY_PROGRESS_TOTALS,
} from "@/src/lib/progress";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const [progressRow] = await db
    .select({
      totalFocusCompletions: userProgress.totalFocusCompletions,
      totalFocusMinutes: userProgress.totalFocusMinutes,
    })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .limit(1);

  const totals = progressRow ?? EMPTY_PROGRESS_TOTALS;

  return Response.json(buildProgressSnapshot(totals));
}
