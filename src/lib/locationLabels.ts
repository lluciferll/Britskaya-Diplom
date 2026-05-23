import type { LocationNode } from "@/domain/types";

export const LOCATION_TIER_LABELS: Record<LocationNode["tier"], string> = {
  world: "Весь мир / план",
  region: "Регион или страна",
  city: "Город или поселение",
  district: "Район или квартал",
  building: "Здание или точка интереса",
};

export function locationTierLabel(tier: LocationNode["tier"]): string {
  return LOCATION_TIER_LABELS[tier] ?? tier;
}
