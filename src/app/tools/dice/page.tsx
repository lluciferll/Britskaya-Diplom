"use client";

import { ForgePage } from "@/components/ForgePage";
import { DiceRoller } from "@/components/tools/DiceRoller";

export default function ToolsDicePage() {
  return (
    <ForgePage title="Кубики" kicker="За столом" subtitle="Разовые броски. Журнал бросков — в сессии кампании.">
      <div className="forge-sheet p-6">
        <DiceRoller />
      </div>
    </ForgePage>
  );
}
