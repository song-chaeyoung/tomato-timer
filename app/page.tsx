import { auth } from "@/auth";
import { getCharacterImageUrl } from "@/src/lib/progress";
import { HomePageClient } from "../components/home/home-page-client";

export default async function Home() {
  const session = await auth();
  const guestCharacterImageUrl = getCharacterImageUrl(1);

  return (
    <HomePageClient
      initialSession={session}
      guestCharacterImageUrl={guestCharacterImageUrl}
    />
  );
}
