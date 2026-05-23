import { Suspense } from "react";

export default function LoreLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="forge-main forge-muted px-4 py-12 text-sm">Загрузка…</div>}>{children}</Suspense>;
}
