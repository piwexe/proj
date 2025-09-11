import { CalcContext, CalcResult } from './types';
import { variantCompactFlat } from './strategies/variant-compact-flat';

export function runEngine(ctx: CalcContext): CalcResult {
  const trace: string[] = [];

  // 1) Определи основную ветку по ключевым признакам:
  if (ctx.isCompact && ctx.plane === 'flat') {
    const res = variantCompactFlat(ctx);
    return res;
  }

  // 2) Добавляй остальные ветви:
  // if (ctx.isCompact && ctx.plane === 'vertical1') { ... }
  // if (!ctx.isCompact && ctx.plane === 'wall') { ... }

  trace.push('Не совпало ни одно правило. Вернул пустой результат.');
  return { rows: [], trace };
}
