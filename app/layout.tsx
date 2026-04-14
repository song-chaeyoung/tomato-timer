import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "뽀모도로 타이머🍅",
  description:
    "Tomato 뽀모도로 타이머로 집중과 휴식을 리듬 있게 관리하세요. PiP 모드로 언제든 타이머를 확인할 수 있습니다.",
  openGraph: {
    title: "Tomato 뽀모도로 타이머",
    description:
      "Tomato 뽀모도로 타이머로 집중과 휴식을 리듬 있게 관리하세요. PiP 모드로 언제든 타이머를 확인할 수 있습니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Tomato 뽀모도로 타이머",
    images: ["/LOGO.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tomato 뽀모도로 타이머",
    description:
      "Tomato 뽀모도로 타이머로 집중과 휴식을 리듬 있게 관리하세요. PiP 모드로 언제든 타이머를 확인할 수 있습니다.",
    images: ["/LOGO.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
