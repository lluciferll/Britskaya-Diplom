/** Броски для стола мастера: формулы вида «+1d8+3», «-2d6+10», без пробелов между термами можно. Преимущество/помеха — через отдельную функцию. */

export type RollResult = {
  total: number;
  formula: string;
  detail: string;
};

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

function rollND(n: number, sides: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i += 1) out.push(rollDie(sides));
  return out;
}

/**
 * Разбор выражения из «кирпичей»: ведущий знак не обязателен.
 * Примеры: `1d8+3`, `2d6+1d4`, `d20+5`, `-1d4+5`
 */
export function evaluateDiceExpression(expr: string): RollResult {
  const raw = expr.trim().replace(/\s+/g, "").replace(/−/g, "-");
  if (!raw) throw new Error("Пустая формула.");

  let s = raw;
  if (!s.startsWith("+") && !s.startsWith("-")) s = `+${s}`;

  const chunks = s.match(/[+-](?:\d*d\d+|\d+)/gi);
  if (!chunks?.length) throw new Error("Ожидались члены вида +1d6 или +5.");

  let total = 0;
  const parts: string[] = [];

  for (const chunk of chunks) {
    const sign = chunk.startsWith("-") ? -1 : 1;
    const body = chunk.slice(1);
    if (!body) continue;

    if (/^\d*d\d+$/i.test(body) || /^d\d+$/i.test(body)) {
      const [nRaw, sidesRaw] = body.toLowerCase().split("d");
      const numDice = nRaw ? Number(nRaw) : 1;
      const sides = Number(sidesRaw);
      if (!Number.isFinite(numDice) || !Number.isFinite(sides)) throw new Error("Некорректные кубики.");
      if (numDice < 1 || numDice > 99 || sides < 2 || sides > 1000) {
        throw new Error("Слишком много кубов или граней (до 99d1000 за терм).");
      }
      const rolls = rollND(numDice, sides);
      const sub = rolls.reduce((a, b) => a + b, 0) * sign;
      total += sub;
      parts.push(`${chunk} → [${rolls.join(", ")}]${numDice > 1 ? ` = ${sub / sign}` : ""} ⇒ ${sign < 0 ? "-" : ""}${Math.abs(sub)}`);
    } else {
      const v = Number(body);
      if (!Number.isFinite(v)) throw new Error("Ожидалось число.");
      total += sign * v;
      parts.push(`${chunk} (${sign * v})`);
    }
  }

  return {
    total,
    formula: expr.trim(),
    detail: parts.join(" · "),
  };
}

export type D20Mode = "normal" | "advantage" | "disadvantage";

export function rollD20WithModifier(mod: number, mode: D20Mode): RollResult {
  const m = Number.isFinite(mod) ? Math.trunc(mod) : 0;
  const a = rollDie(20);
  const b = rollDie(20);

  if (mode === "normal") {
    const t = a + m;
    return {
      total: t,
      formula: `1d20 + ${m}`,
      detail: `d20 = ${a} · итого ${t}`,
    };
  }

  if (mode === "advantage") {
    const pick = Math.max(a, b);
    const t = pick + m;
    return {
      total: t,
      formula: `1d20 (преимущество) + ${m}`,
      detail: `d20 ${a} и ${b} → выше ${pick} · итого ${t}`,
    };
  }

  const pick = Math.min(a, b);
  const t = pick + m;
  return {
    total: t,
    formula: `1d20 (помеха) + ${m}`,
    detail: `d20 ${a} и ${b} → ниже ${pick} · итого ${t}`,
  };
}
