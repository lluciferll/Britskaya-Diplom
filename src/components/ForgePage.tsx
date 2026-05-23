"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useMemo, type ReactNode } from "react";
import { AppShell, type Crumb } from "@/components/AppShell";
import { parentFromBreadcrumbs, resolveBreadcrumbs, sanitizeReturnPath } from "@/lib/navigation";
import { useForgeStore } from "@/store/useForgeStore";

type Props = {
  title: string;
  kicker?: string;
  subtitle?: string;
  /** Дополнительные крошки после автоматических (редко нужно) */
  breadcrumbExtra?: Crumb[];
  /** Полностью заменить автоматические крошки */
  breadcrumbOverride?: Crumb[];
  children: ReactNode;
};

/** Next.js 15: useSearchParams требует Suspense при prerender. */
export function ForgePage(props: Props) {
  return (
    <Suspense fallback={<ForgePageShell {...props} />}>
      <ForgePageInner {...props} />
    </Suspense>
  );
}

function ForgePageShell({
  title,
  kicker,
  subtitle,
  breadcrumbOverride,
  breadcrumbExtra,
  children,
}: Props) {
  const breadcrumb = breadcrumbOverride ?? breadcrumbExtra;
  return (
    <AppShell title={title} kicker={kicker} subtitle={subtitle} breadcrumb={breadcrumb?.length ? breadcrumb : undefined}>
      {children}
    </AppShell>
  );
}

function ForgePageInner({ title, kicker, subtitle, breadcrumbExtra, breadcrumbOverride, children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const campaigns = useForgeStore((s) => s.campaigns);

  const breadcrumb = useMemo(() => {
    if (breadcrumbOverride) return breadcrumbOverride;
    const campaignParam = searchParams.get("campaign");
    const from =
      searchParams.get("from") ||
      (campaignParam ? `/campaigns/${campaignParam}` : null);
    const fromLabel = searchParams.get("fromLabel");
    const base = resolveBreadcrumbs(pathname ?? "/", {
      from,
      fromLabel,
      resolveCampaignTitle: (id) => campaigns.find((c) => c.id === id)?.title,
    });
    return breadcrumbExtra?.length ? [...base, ...breadcrumbExtra] : base;
  }, [pathname, searchParams, campaigns, breadcrumbExtra, breadcrumbOverride]);

  const back = useMemo(() => {
    const from = sanitizeReturnPath(searchParams.get("from"));
    const campaignParam = searchParams.get("campaign");
    const effectiveFrom = from || (campaignParam ? `/campaigns/${campaignParam}` : null);
    if (effectiveFrom) {
      const label =
        searchParams.get("fromLabel")?.trim() ||
        (campaignParam ? campaigns.find((c) => c.id === campaignParam)?.title : undefined) ||
        parentFromBreadcrumbs(breadcrumb)?.label ||
        "Назад";
      return { href: effectiveFrom, label };
    }
    return parentFromBreadcrumbs(breadcrumb);
  }, [searchParams, campaigns, breadcrumb]);

  return (
    <ForgePageShell
      title={title}
      kicker={kicker}
      subtitle={subtitle}
      breadcrumbExtra={breadcrumbExtra}
      breadcrumbOverride={breadcrumb.length > 0 ? breadcrumb : breadcrumbOverride}
    >
      {back && (
        <div className="mb-3">
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--tt-fg)] underline underline-offset-[3px] decoration-[var(--tt-line)] hover:opacity-80"
          >
            <span aria-hidden>←</span>
            {back.label}
          </Link>
        </div>
      )}
      {children}
    </ForgePageShell>
  );
}
