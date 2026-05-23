import { AppShell } from "@/components/AppShell";
import { HomeDashboard } from "@/components/home/HomeDashboard";

export default function HomePage() {
  return (
    <AppShell
      title="Master Forge"
      kicker="Мастерская мастера"
      subtitle="Продолжите подготовку или откройте инструмент за столом — без лишних обходов через меню."
    >
      <HomeDashboard />
    </AppShell>
  );
}
