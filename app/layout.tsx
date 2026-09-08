import type { Metadata } from "next";
import { activeHousing } from "@/data/housing";
import "./globals.css";

export const metadata: Metadata = {
  title: activeHousing.title,
  description: `${activeHousing.housingName} 보증금 전환과 예상 월 주거비를 10초 만에 확인해보세요.`,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
