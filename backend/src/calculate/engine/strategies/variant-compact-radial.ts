import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

/**
 * Стратегия для радиальной схемы без эксцентриситета:
 *  - plane != 'flat' и plane != 'wall2'
 *  - l1 = l2 = l3 = 0
 */
@Injectable()
export class VariantCompactRadialStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const notAxialPlane = input.plane !== 'flat' && input.plane !== 'wall' && input.plane !== 'wall2';
    const noEccentricity = input.l1 === 0 && input.l2 === 0 && input.l3 === 0;

    return notAxialPlane && noEccentricity;
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

    // 1) радиальная нагрузка на одну каретку:
    const F = (input.mass * G) / (input.guideCount * input.carriageCount);

    // 2) берём все направляющие из БД
    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    // 3) считаем K = Fmax / F для каждой
    const rows: [string, string][] = guides.map((g) => {
      const Fmax = Number((g as any).radialnaya ?? 0); // допустимая радиальная нагрузка
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

    return {
      ok: true,
      variant: 'variant-compact-radial',
      load: Number(F.toFixed(3)), // радиальная нагрузка, Н
      rows,
      notes: [`napr=${input.guideCount}, karetki=${input.carriageCount}`],
    } as CalculateResult & { rows: [string, string][] };
  }
}
