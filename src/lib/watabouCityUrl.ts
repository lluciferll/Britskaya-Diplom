/** Параметры, совместимые с https://watabou.github.io/city-generator/ (query string). */

export type WatabouCityParams = {
  size: number;
  seed: number;
  citadel: 0 | 1;
  urban_castle: 0 | 1;
  plaza: 0 | 1;
  temple: 0 | 1;
  walls: 0 | 1;
  shantytown: 0 | 1;
  coast: 0 | 1;
  river: 0 | 1;
  greens: 0 | 1;
  /** -1 = авто по генератору */
  gates: number;
};

export const DEFAULT_WATABOU_PARAMS: WatabouCityParams = {
  size: 25,
  seed: 315608654,
  citadel: 1,
  urban_castle: 1,
  plaza: 1,
  temple: 1,
  walls: 1,
  shantytown: 0,
  coast: 0,
  river: 0,
  greens: 0,
  gates: -1,
};

const BASE = "https://watabou.github.io/city-generator/";

export function buildWatabouCityUrl(p: WatabouCityParams): string {
  const q = new URLSearchParams({
    size: String(p.size),
    seed: String(p.seed),
    citadel: String(p.citadel),
    urban_castle: String(p.urban_castle),
    plaza: String(p.plaza),
    temple: String(p.temple),
    walls: String(p.walls),
    shantytown: String(p.shantytown),
    coast: String(p.coast),
    river: String(p.river),
    greens: String(p.greens),
    gates: String(p.gates),
  });
  return `${BASE}?${q.toString()}`;
}

/** Случайный seed 1…999999999 для новой раскладки. */
export function randomWatabouSeed(): number {
  return Math.floor(1 + Math.random() * 999_999_998);
}
