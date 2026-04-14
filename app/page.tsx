import { auth } from "@/auth";
import { getCharacterImageUrl } from "@/src/lib/progress";
import { ClientOnlyTimerApp } from "./timer-client";

export default async function Home() {
  const session = await auth();
  const guestCharacterImageUrl = getCharacterImageUrl(1);

  return (
    <ClientOnlyTimerApp
      initialSession={session}
      guestCharacterImageUrl={guestCharacterImageUrl}
    />
  );
}
