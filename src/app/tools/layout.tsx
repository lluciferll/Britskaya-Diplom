import { Suspense } from "react";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="forge-main forge-muted px-4 py-12 text-sm">Загрузка…</div>}>{children}</Suspense>;
}
