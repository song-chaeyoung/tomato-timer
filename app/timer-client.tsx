"use client";

import dynamic from "next/dynamic";

const TomatoApp = dynamic(() => import("@/src/App"), { ssr: false });

export function ClientOnlyTimerApp() {
  return <TomatoApp />;
}
