import { auth } from "@/auth";
import { ClientOnlyTimerApp } from "./timer-client";

export default async function Home() {
  const session = await auth();

  return <ClientOnlyTimerApp initialSession={session} />;
}
