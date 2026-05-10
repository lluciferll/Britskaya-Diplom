"use client";

import { useMemo, useState } from "react";
import { buildLoreGraph } from "@/lib/loreGraph";
import type { Campaign, LoreGraphManualEdge } from "@/domain/types";
import { useForgeStore } from "@/store/useForgeStore";

function layoutCircle(n: number, index: number): { x: number; y: number } {
  const cx = 260;
  const cy = 260;
  const R = n <= 1 ? 0 : Math.min(175, 130 + n * 6);
  const a = (Math.PI * 2 * index) / Math.max(n, 1) - Math.PI / 2;
  return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
}

const KIND_COLOR: Record<LoreGraphManualEdge["fromKind"], string> = {
  wiki: "#0a0a0a",
  character: "#2563eb",
  location: "#16a34a",
  faction: "#9333ea",
  quest: "#ea580c",
};

export function LoreGraphCampaignPanel({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const addEdge = useForgeStore((s) => s.addLoreManualEdge);
  const removeEdge = useForgeStore((s) => s.removeLoreManualEdge);

  const [fromKind, setFromKind] = useState<LoreGraphManualEdge["fromKind"]>("wiki");
  const [fromId, setFromId] = useState("");
  const [toKind, setToKind] = useState<LoreGraphManualEdge["toKind"]>("wiki");
  const [toId, setToId] = useState("");
  const [edgeNote, setEdgeNote] = useState("");

  const data = useMemo(() => (campaign ? buildLoreGraph(campaign as Campaign) : { nodes: [], edges: [] }), [campaign]);
  const coords = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    data.nodes.forEach((n, i) => {
      m.set(n.uid, layoutCircle(data.nodes.length, i));
    });
    return m;
  }, [data.nodes]);

  if (!campaign) return <p className="forge-muted">Кампания не найдена.</p>;

  const idOptions = (kind: LoreGraphManualEdge["fromKind"]) => {
    switch (kind) {
      case "wiki":
        return campaign.wikiArticles ?? [];
      case "character":
        return campaign.characters ?? [];
      case "location":
        return campaign.locations ?? [];
      case "faction":
        return campaign.factions ?? [];
      case "quest":
        return campaign.quests ?? [];
      default:
        return [];
    }
  };

  const labelFor = (kind: LoreGraphManualEdge["fromKind"], id: string) => {
    if (kind === "wiki") {
      return (campaign.wikiArticles ?? []).find((w) => w.slug === id)?.title ?? id;
    }
    const list = idOptions(kind);
    const hit = list.find((x: { id?: string }) => x.id === id);
    if (!hit) return id;
    return (hit as { name?: string; title?: string }).name ?? (hit as { title?: string }).title ?? id;
  };

  return (
    <div className="space-y-6">
      <div className="forge-inset text-[12px] leading-relaxed forge-muted">
        Каждый узел — сущность вашей кампании. Пунктирные связи появляются когда имя локации или персонажа упоминается текстом внутри вики-статьи без скобок{" "}
        <span className="font-mono text-[var(--tt-fg)]">[[ ]]</span>. Сплошные связи — синтаксис статей или ручные добавления ниже.
        <strong className="block pt-2 text-[var(--tt-fg)]">
          Большие кампании пока визуализируются упрощённым кругом без физического «рыхления» — это намеренный упрощённый MVP.
        </strong>
      </div>

      <div className="overflow-x-auto border border-dotted border-[var(--tt-line-strong)] bg-[var(--tt-bg-elev)]">
        <svg width={520} height={520} aria-label="Граф лора">
          <title>Граф лора кампании</title>
          {data.edges.map((e) => {
            const a = coords.get(e.from);
            const b = coords.get(e.to);
            if (!a || !b) return null;
            const k = e.from.split(":")[0] as LoreGraphManualEdge["fromKind"];
            const color = KIND_COLOR[k] ?? "#0a0a0a";
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={color}
                strokeWidth={e.dashed ? 0.85 : 1.3}
                strokeOpacity={0.45}
                strokeDasharray={e.dashed ? "4 4" : undefined}
              />
            );
          })}
          {data.nodes.map((n) => {
            const p = coords.get(n.uid);
            if (!p) return null;
            const fill = KIND_COLOR[n.kind];
            return (
              <g key={n.uid}>
                <circle cx={p.x} cy={p.y} r={9} fill={fill} />
                <text x={p.x + 12} y={p.y + 4} className="fill-[var(--tt-fg)] text-[9px] uppercase" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {n.label.length > 26 ? `${n.label.slice(0, 24)}…` : n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <section className="forge-inset space-y-4 p-4">
        <h3 className="forge-label">Ручная связь (если автоматика не поймала)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="forge-label">От ({fromKind})</span>
            <select value={fromKind} onChange={(e) => setFromKind(e.target.value as LoreGraphManualEdge["fromKind"])} className="forge-field mt-2">
              <option value="wiki">Вики</option>
              <option value="character">Персонаж</option>
              <option value="location">Локация</option>
              <option value="faction">Фракция</option>
              <option value="quest">Квест</option>
            </select>
            <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="forge-field mt-2 font-mono text-[11px]">
              <option value="">— выберите —</option>
              {idOptions(fromKind).map((row) => {
                const val = fromKind === "wiki" ? (row as { slug: string }).slug : (row as { id: string }).id;
                const lbl = labelFor(fromKind, val);
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="text-sm">
            <span className="forge-label">К ({toKind})</span>
            <select value={toKind} onChange={(e) => setToKind(e.target.value as LoreGraphManualEdge["toKind"])} className="forge-field mt-2">
              <option value="wiki">Вики</option>
              <option value="character">Персонаж</option>
              <option value="location">Локация</option>
              <option value="faction">Фракция</option>
              <option value="quest">Квест</option>
            </select>
            <select value={toId} onChange={(e) => setToId(e.target.value)} className="forge-field mt-2 font-mono text-[11px]">
              <option value="">— выберите —</option>
              {idOptions(toKind).map((row) => {
                const val = toKind === "wiki" ? (row as { slug: string }).slug : (row as { id: string }).id;
                const lbl = labelFor(toKind, val);
                return (
                  <option key={val} value={val}>
                    {lbl}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="forge-label">Подпись на линию (опционально)</span>
          <input value={edgeNote} onChange={(e) => setEdgeNote(e.target.value)} className="forge-field mt-2" />
        </label>
        <button
          type="button"
          className="forge-btn-gold"
          onClick={() => {
            if (!fromId || !toId) return;
            addEdge(campaignId, { fromKind, fromId, toKind, toId, label: edgeNote.trim() || undefined });
            setEdgeNote("");
          }}
        >
          Добавить ребро вручную
        </button>
        <ul className="space-y-2 text-[11px] forge-muted">
          {(campaign.loreGraphExtras ?? []).map((edge) => (
            <li key={edge.id} className="flex flex-wrap justify-between gap-2 border-t border-dotted border-[var(--tt-line)] pt-2 first:border-t-0 first:pt-0">
              <span>
                {edge.fromKind}:{labelFor(edge.fromKind, edge.fromId)} → {edge.toKind}:{labelFor(edge.toKind, edge.toId)}
                {edge.label ? ` · ${edge.label}` : ""}
              </span>
              <button type="button" className="forge-muted underline" onClick={() => removeEdge(campaignId, edge.id)}>
                убрать
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
