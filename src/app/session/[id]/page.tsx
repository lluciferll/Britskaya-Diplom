"use client";

import { useParams } from "next/navigation";
import { SessionRoom } from "@/components/session/SessionRoom";

export default function SessionPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) return null;
  return <SessionRoom campaignId={id} />;
}
