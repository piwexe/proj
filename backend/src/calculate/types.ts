export type TableRow = [code: string, safetyFactor: string];

export interface CalcContext {
  // входные данные
  isCompact: boolean;
  l1: number; l2: number; l3: number; l4: number; l5: number;
  maxTemperature: number;
  aggressiveEnv: boolean;
  guideCount: number;
  carriageCount: number;
  plane: string;

  // внешние данные при необходимости
  // guides: RollerGuide[]; // если нужно подтягивать заранее
}

export interface CalcResult {
  rows: TableRow[];
  trace: string[];      // пояснения по веткам
  warnings?: string[];  // мягкие предупреждения
}

export function ok(rows: TableRow[], trace: string[], warnings: string[] = []): CalcResult {
  return { rows, trace, warnings };
}
