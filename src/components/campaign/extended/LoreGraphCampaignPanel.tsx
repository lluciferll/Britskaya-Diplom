"use client";

import { useMemo, useState } from "react";
import { buildLoreGraph, type LoreGraphNode } from "@/lib/loreGraph";
import type { Campaign, LoreGraphManualEdge } from "@/domain/types";
import { useForgeStore } from "@/store/useForgeStore";

const SVG = 520;
const CX = SVG / 2;
const CY = SVG / 2;

function layoutCircle(n: number, index: number): { x: number; y: number } {
  const R = n <= 1 ? 0 : Math.min(200, 120 + n * 5);
  const a = (Math.PI * 2 * index) / Math.max(n, 1) - Math.PI / 2;
  return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
}

const KIND_COLOR: Record<LoreGraphNode["kind"], string> = {
  wiki: "#0a0a0a",
  character: "#2563eb",
  location: "#16a34a",
  faction: "#9333ea",
  quest: "#ea580c",
};

const KIND_LABEL: Record<LoreGraphNode["kind"], string> = {
  wiki: "Вики",
  character: "Персонаж",
  location: "Локация",
  faction: "Фракция",
  quest: "Квест",
};

type KindFilter = LoreGraphNode["kind"] | "all";

export function LoreGraphCampaignPanel({ campaignId }: { campaignId: string }) {
  const campaign = useForgeStore((s) => s.campaigns.find((c) => c.id === campaignId) ?? null);
  const addEdge = useForgeStore((s) => s.addLoreManualEdge);
  const removeEdge = useForgeStore((s) => s.removeLoreManualEdge);

  const [fromKind, setFromKind] = useState<LoreGraphManualEdge["fromKind"]>("wiki");
  const [fromId, setFromId] = useState("");
  const [toKind, setToKind] = useState<LoreGraphManualEdge["toKind"]>("wiki");
  const [toId, setToId] = useState("");
  const [edgeNote, setEdgeNote] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const data = useMemo(() => (campaign ? buildLoreGraph(campaign as Campaign) : { nodes: [], edges: [] }), [campaign]);

  const visibleNodes = useMemo(
    () => (kindFilter === "all" ? data.nodes : data.nodes.filter((n) => n.kind === kindFilter)),
    [data.nodes, kindFilter],
  );

  const visibleIds = useMemo(() => new Set(visibleNodes.map((n) => n.uid)), [visibleNodes]);

  const visibleEdges = useMemo(
    () => data.edges.filter((e) => visibleIds.has(e.from) && visibleIds.has(e.to)),
    [data.edges, visibleIds],
  );

  const coords = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    visibleNodes.forEach((n, i) => m.set(n.uid, layoutCircle(visibleNodes.length, i)));
    return m;
  }, [visibleNodes]);

  const connected = useMemo(() => {
    if (!selectedUid) return [];
    return visibleEdges.filter((e) => e.from === selectedUid || e.to === selectedUid);
  }, [selectedUid, visibleEdges]);

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
    if (kind === "wiki") return (campaign.wikiArticles ?? []).find((w) => w.slug === id)?.title ?? id;
    const list = idOptions(kind);
    const hit = list.find((x: { id?: string }) => x.id === id);
    if (!hit) return id;
    return (hit as { name?: string; title?: string }).name ?? (hit as { title?: string }).title ?? id;
  };

  const selectedNode = selectedUid ? data.nodes.find((n) => n.uid === selectedUid) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] forge-muted">
          {visibleNodes.length} узлов · {visibleEdges.length} связей
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр типа узла">
          <button
            type="button"
            className={kindFilter === "all" ? "forge-tab forge-tab-active" : "forge-tab"}
            onClick={() => setKindFilter("all")}
          >
            Все
          </button>
          {(Object.keys(KIND_LABEL) as LoreGraphNode["kind"][]).map((k) => (
            <button
              key={k}
              type="button"
              className={kindFilter === k ? "forge-tab forge-tab-active" : "forge-tab"}
              onClick={() => setKindFilter(k)}
            >
              {KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] font-mono uppercase tracking-wider forge-muted">
        {(Object.keys(KIND_LABEL) as LoreGraphNode["kind"][]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} />
            {KIND_LABEL[k]}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-px w-4 border-t border-dashed border-[var(--tt-fg)] opacity-50" />
          упоминание
        </span>
      </div>

      {visibleNodes.length === 0 ? (
        <p className="forge-muted text-sm">Нет узлов для отображения. Добавьте персонажей, локации, квесты или статьи вики.</p>
      ) : (
        <div className="w-full overflow-x-auto border border-dotted border-[var(--tt-line)] bg-[var(--tt-bg-elev)]">
          <svg
            viewBox={`0 0 ${SVG} ${SVG}`}
            width="100%"
            height="auto"
            style={{ minHeight: "min(72vw, 320px)", maxWidth: SVG }}
            aria-label="Граф связей кампании"
            className="mx-auto block"
            preserveAspectRatio="xMidYMid meet"
          >
            <title>Граф связей</title>
            {visibleEdges.map((e) => {
              const a = coords.get(e.from);
              const b = coords.get(e.to);
              if (!a || !b) return null;
              const highlighted = selectedUid && (e.from === selectedUid || e.to === selectedUid);
              const k = e.from.split(":")[0] as LoreGraphNode["kind"];
              return (
                <line
                  key={`${e.from}-${e.to}-${e.label}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={KIND_COLOR[k] ?? "#0a0a0a"}
                  strokeWidth={highlighted ? 2 : e.dashed ? 0.85 : 1.3}
                  strokeOpacity={highlighted ? 0.85 : 0.4}
                  strokeDasharray={e.dashed ? "4 4" : undefined}
                />
              );
            })}
            {visibleNodes.map((n) => {
              const p = coords.get(n.uid);
              if (!p) return null;
              const active = selectedUid === n.uid;
              return (
                <g
                  key={n.uid}
                  className="cursor-pointer"
                  onClick={() => setSelectedUid((u) => (u === n.uid ? null : n.uid))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setSelectedUid((u) => (u === n.uid ? null : n.uid));
                    }
                  }}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={active ? 12 : 9}
                    fill={KIND_COLOR[n.kind]}
                    stroke={active ? "var(--tt-fg)" : "transparent"}
                    strokeWidth={2}
                  />
                  <text
                    x={p.x + 14}
                    y={p.y + 4}
                    className="fill-[var(--tt-fg)] text-[9px] uppercase pointer-events-none"
                    style={{ fontFamily: "var(--font-geist-mono)" }}
                  >
                    {n.label.length > 22 ? `${n.label.slice(0, 20)}…` : n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {selectedNode && (
        <div className="forge-inset p-4 text-sm">
          <p className="forge-label">{KIND_LABEL[selectedNode.kind]}</p>
          <p className="mt-1 font-semibold">{selectedNode.label}</p>
          {connected.length > 0 ? (
            <ul className="mt-3 space-y-1 text-[12px] forge-muted">
              {connected.map((e) => {
                const other = e.from === selectedUid ? e.to : e.from;
                const otherNode = data.nodes.find((n) => n.uid === other);
                return (
                  <li key={`${e.from}-${e.to}`}>
                    {e.dashed ? "··· " : "— "}
                    {otherNode?.label ?? other}
                    {e.label ? ` (${e.label})` : ""}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-[12px] forge-muted">Связей с другими узлами нет.</p>
          )}
        </div>
      )}

      <section className="forge-inset space-y-4 p-4">
        <h3 className="forge-label">Ручная связь</h3>
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
                return (
                  <option key={val} value={val}>
                    {labelFor(fromKind, val)}
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
                return (
                  <option key={val} value={val}>
                    {labelFor(toKind, val)}
                  </option>
                );
              })}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="forge-label">Подпись (опционально)</span>
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
          Добавить связь
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
