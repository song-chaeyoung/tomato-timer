"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import HomeScreen from "@/src/screens/home/HomeScreen";

type HomePageClientProps = {
  initialSession: Session | null;
  guestCharacterImageUrl: string | null;
};

export function HomePageClient({
  initialSession,
  guestCharacterImageUrl,
}: HomePageClientProps) {
  return (
    <SessionProvider session={initialSession}>
      <HomeScreen guestCharacterImageUrl={guestCharacterImageUrl} />
    </SessionProvider>
  );
}
