import { CalcContext, CalcResult } from '../types';

export function variantCompactFlat(ctx: CalcContext): CalcResult {
  const trace: string[] = [];
  trace.push('Ветка: Compact + плоскость = flat');

  // простая формула прямо в теле стратегии
  if (ctx.l4 <= 0 || ctx.l5 <= 0) {
    trace.push(`❌ Ошибка: L4 (${ctx.l4}) и L5 (${ctx.l5}) должны быть > 0`);
    return { rows: [], trace, warnings: ['Некорректные параметры L4/L5'] };
  }

  let multiplier = 1;
  if (ctx.aggressiveEnv) {
    multiplier *= 0.9;
    trace.push('Агрессивная среда → множитель 0.9');
  }
  if (ctx.maxTemperature > 60) {
    multiplier *= 0.85;
    trace.push('Температура > 60°C → множитель 0.85');
  }

  const base = (ctx.l4 + ctx.l5) / Math.max(1, ctx.guideCount * ctx.carriageCount);

  const codes = ['V28-3', 'V28-4A', 'V35-3'];
  const rows = codes.map(code => {
    const k = (base * multiplier * 2.5) / 100;
    const formatted = k.toFixed(2).replace('.', ','); // формат прямо здесь
    return [code, formatted] as [string, string];
  });

  trace.push(`Сформировано ${rows.length} строк`);

  return { rows, trace };
}
