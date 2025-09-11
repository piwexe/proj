
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

/**
 * Стратегия для осевой схемы без эксцентриситета:
 *  - plane = 'flat' ИЛИ 'wall2'
 *  - l1 = l2 = l3 = 0
 *
 * Логика перенесена из предыдущего calculate.service.ts.
 */
@Injectable()
export class VariantCompactFlatStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const planeIsAxial = input.plane === 'flat' || input.plane === 'wall2';
    const noEccentricity = input.l1 === 0 && input.l2 === 0 && input.l3 === 0;
    return planeIsAxial && noEccentricity;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    // проверки входных параметров
    if (input.mass <= 0) {
      throw new BadRequestException('mass должен быть > 0');
    }
    if (input.guideCount <= 0) {
      throw new BadRequestException('guideCount должен быть > 0');
    }
    if (input.carriageCount <= 0) {
      throw new BadRequestException('carriageCount должен быть > 0');
    }

    // 1) осевая нагрузка на ОДНУ каретку:
    // F = (m * g) / (napr * karetki)
    const F = (input.mass * G) / (input.guideCount * input.carriageCount);

    // 2) берём все направляющие/каретки из БД
    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    // 3) считаем K = Fmax / F для каждой; формат «1,23»
    const rows: [string, string][] = guides.map((g) => {
      const Fmax = Number((g as any).axial ?? 0); // допустимая осевая нагрузка (из БД)
      const K = F <= 0 ? 0 : Fmax / F;
      const formatted = K.toFixed(2).replace('.', ',');
      return [g.name, formatted];
    });

    // 4) сортировка по убыванию запаса
    rows.sort(
      (a, b) =>
        parseFloat((b[1] || '0').replace(',', '.')) -
        parseFloat((a[1] || '0').replace(',', '.')),
    );

    // Возвращаем стандартный результат движка + полезную нагрузку rows
    return {
      ok: true,
      variant: 'variant-compact-flat',
      // дополнительное поле, чтобы фронт мог получить то же, что и раньше
      // (массив пар [код, "K"])
      rows,
      notes: [
        `F(на каретку)=${F.toFixed(3)} Н`,
        `napr=${input.guideCount}, karetki=${input.carriageCount}`,
      ],
    } as CalculateResult & { rows: [string, string][] };
  }
}
