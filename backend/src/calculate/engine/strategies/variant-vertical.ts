import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

@Injectable()
export class VariantVerticalStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  // Условие выбора стратегии: rasp == "вертикально" и есть хотя бы одно смещение
  canHandle(input: CalculateInput): boolean {
    const isVertical = input.plane === 'vertical1' || input.plane === 'vertical2';
    const hasEccentricity = !(input.l1 === 0 && input.l2 === 0 && input.l3 === 0);
    return isVertical && hasEccentricity;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    // Проверка входных данных
    if (input.mass <= 0) throw new BadRequestException('mass должен быть > 0');
    if (input.carriageCount <= 0) throw new BadRequestException('carriageCount должен быть > 0');
    if (input.carriageCount !== 1 && input.carriageCount !== 2) throw new BadRequestException('carriageCount должен быть 1 или 2');
    if (input.guideCount !== 1 && input.guideCount !== 2) throw new BadRequestException('guideCount должен быть 1 или 2');
    
    // Инициализация переменных
    const m = input.mass;
    const karetki = input.carriageCount;
    const L1 = input.l1;
    const L2 = input.l2;
    const L4 = input.l4;
    const L5 = input.l5;

    // 1) Вычисляем радиальную нагрузку:
    const Fmax = (input.mass * G) / (input.carriageCount * input.guideCount);

    // 2) Проверяем смещения и вычисляем моментные нагрузки:
    let My = 0;
    let Mz = 0;
    let osev2 = 0;
    let nagL1 = 0;
    let nagL2 = 0;

    if (karetki === 1) {
      // одна каретка
      if (L1 !== 0 && L2 !== 0) {
        My = Math.abs((m * G * L1)/ (karetki));
        Mz = Math.abs((m * G * L2)/ (karetki))
      }
      osev2 = 0;
    } else if (karetki === 2) {
      // две каретки
      My = 0;
      Mz = 0;
      if (L1 !== 0 && L2 !== 0 && L4 !== 0 && L5 !== 0) {
        nagL1 = Math.abs((m * G * L2)/ (karetki* L4));
        nagL2 = Math.abs((m * G * L2)/ (karetki* L5));
        osev2 = nagL1 + nagL2;
      }
    }

    // 5) Получаем данные из базы для расчёта коэффициента запаса
    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    // 6) Вычисляем коэффициент запаса для каждой направляющей
    const rows: [string, string][] = guides.map((g) => {
      const My_bd = Number((g as any).my ?? 0);
      const Mz_bd = Number((g as any).mz ?? 0);
      const osevaya_bd = Number((g as any).axial ?? 0);
      const rad_bd = Number((g as any).radial ?? 0);

      let sum = 0;
      if (Mz > 0 && Mz_bd > 0) sum += Mz / Mz_bd;
      if (My > 0 && My_bd > 0) sum += My / My_bd;
      if (Fmax > 0 && rad_bd > 0) sum += Fmax / rad_bd;
      if (osev2 > 0 && osevaya_bd > 0) sum += osev2 / osevaya_bd;

      const K = sum > 0 ? 1 / sum : 0;
      const formatted = K.toFixed(2).replace('.', ',');
      return [g.name, formatted];
    });

    rows.sort(
      (a, b) =>
        parseFloat((b[1] || '0').replace(',', '.')) -
        parseFloat((a[1] || '0').replace(',', '.')),
    );

    return {
      ok: true,
      variant: 'variant-vertical',
      load: Number(Fmax.toFixed(3)), // Н; округляем для стабильности
      rows,
      notes: [
      `napr=${input.guideCount}, karetki=${input.carriageCount}`,
      `Mx=${Mz.toFixed(3)} Н·м, My=${My.toFixed(3)} Н·м, osev2=${osev2.toFixed(3)} Н`,
    ],
    } as CalculateResult & { rows: [string, string][] };
  }
}
