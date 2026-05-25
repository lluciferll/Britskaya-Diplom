import type { Metadata } from "next";

import "./globals.css";

import type { ReactNode } from "react";

import { CampaignCloudSync } from "@/components/CampaignCloudSync";



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

    <html lang="ru">

      <body className="font-mono">

        <CampaignCloudSync>{children}</CampaignCloudSync>

      </body>

    </html>

  );

}


