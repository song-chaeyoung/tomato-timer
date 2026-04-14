"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

const TomatoApp = dynamic(() => import("@/src/App"), { ssr: false });

type ClientOnlyTimerAppProps = {
  initialSession: Session | null;
};

export function ClientOnlyTimerApp({
  initialSession,
}: ClientOnlyTimerAppProps) {
  return (
    <SessionProvider session={initialSession}>
      <TomatoApp />
    </SessionProvider>
  );
}
