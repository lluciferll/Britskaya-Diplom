"use client";

import { AppShell } from "@/components/AppShell";
import { DiceRoller } from "@/components/tools/DiceRoller";

export default function ToolsDicePage() {
  return (
    <AppShell
      title="Кубики"
      kicker="За столом"
      breadcrumb={[{ href: "/tools", label: "За столом" }]}
      subtitle="Разовые броски без записи. Чтобы сохранялся журнал — откройте стол мастера из карточки кампании («Сессия»)."
    >
      <div className="forge-sheet mt-6 p-6">
        <DiceRoller />
      </div>
      <p className="forge-muted mt-6 max-w-xl text-xs leading-relaxed">
        Путь: список кампаний → ваша запись → сверху блок «На игровом столе» → «Сессия».
      </p>
    </AppShell>
  );
}
