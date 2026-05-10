"use client";

import { useParams } from "next/navigation";
import { CampaignScreen } from "@/components/campaign/CampaignScreen";

export default function CampaignPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) return null;
  return <CampaignScreen campaignId={id} />;
}
