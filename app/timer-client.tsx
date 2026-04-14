"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

const TomatoApp = dynamic(() => import("@/src/App"), { ssr: false });

type ClientOnlyTimerAppProps = {
  initialSession: Session | null;
  guestCharacterImageUrl: string | null;
};

export function ClientOnlyTimerApp({
  initialSession,
  guestCharacterImageUrl,
}: ClientOnlyTimerAppProps) {
  return (
    <SessionProvider session={initialSession}>
      <TomatoApp guestCharacterImageUrl={guestCharacterImageUrl} />
    </SessionProvider>
  );
}
