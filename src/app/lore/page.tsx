import { LoreReferenceBrowser } from "@/components/lore/LoreReferenceBrowser";
import { ForgePage } from "@/components/ForgePage";

export default function LoreReferencePage() {
  return (
    <ForgePage title="Справка SRD 5e" kicker="Справочник" subtitle="Заклинания, монстры, божества и др. (OGL/SRD).">
      <div className="mx-auto max-w-6xl space-y-8 pb-16">
        <LoreReferenceBrowser />
      </div>
    </ForgePage>
  );
}
