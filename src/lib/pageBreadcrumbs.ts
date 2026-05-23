import type { Crumb } from "@/components/AppShell";

export function crumbsCampaigns(): Crumb[] {
  return [{ href: "/campaigns", label: "Кампании" }];
}

export function crumbsCampaign(campaignTitle: string, campaignId: string): Crumb[] {
  return [
    { href: "/campaigns", label: "Кампании" },
    { href: `/campaigns/${campaignId}`, label: campaignTitle || "Кампания" },
  ];
}

export function crumbsSession(campaignTitle: string, campaignId: string): Crumb[] {
  return [...crumbsCampaign(campaignTitle, campaignId), { href: `/session/${campaignId}`, label: "Сессия" }];
}

export function crumbsMap(campaignTitle: string, campaignId: string): Crumb[] {
  return [...crumbsCampaign(campaignTitle, campaignId), { href: `/maps/${campaignId}`, label: "Карта" }];
}

export function crumbsGenerators(): Crumb[] {
  return [{ href: "/generators", label: "Генераторы" }];
}

export function crumbsTools(): Crumb[] {
  return [{ href: "/tools", label: "За столом" }];
}

export function crumbsLore(): Crumb[] {
  return [{ href: "/lore", label: "Справка" }];
}
