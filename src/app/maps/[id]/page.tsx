"use client";

import { useParams } from "next/navigation";
import { MapViewport } from "@/components/maps/MapViewport";

export default function MapPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) return null;
  return <MapViewport campaignId={id} />;
}
