import { Suspense, type ReactNode } from "react";

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="forge-main forge-muted px-4 py-12 text-sm">Загрузка…</div>}>{children}</Suspense>;
}
