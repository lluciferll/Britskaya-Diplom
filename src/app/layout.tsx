import type { Metadata } from "next";
import { JetBrains_Mono, PT_Serif } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import { CampaignCloudSync } from "@/components/CampaignCloudSync";

/** У Newsreader в next/font/google нет subset `cyrillic` — `next build` в Docker падал с ошибкой. */
const displaySerif = PT_Serif({
  subsets: ["latin", "cyrillic"],
  variable: "--font-forge-serif",
  weight: ["400", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Master Forge — мастерская мастера",
  description: "Кампании, справка SRD, генераторы, сессия и карты для мастера настольных ролевых игр.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${displaySerif.variable} ${mono.variable}`}>
      <body className="font-mono">
        <CampaignCloudSync>{children}</CampaignCloudSync>
      </body>
    </html>
  );
}
