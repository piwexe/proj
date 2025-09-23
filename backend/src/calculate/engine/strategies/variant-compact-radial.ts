import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

@Injectable()
export class VariantCompactRadialStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const notAxialPlane = input.plane === 'vertical1' || input.plane === 'vertical2' || input.plane === 'horizontal' || input.plane === 'wall2';
    const noEccentricity = input.l1 === 0 && input.l2 === 0 && input.l3 === 0;
    return notAxialPlane && noEccentricity;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    
    // 1) радиальная нагрузка на одну каретку:
    const F = (input.mass * G) / (input.guideCount * input.carriageCount);

    // 2) берём все направляющие из БД
    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    // 3) считаем K = Fmax / F для каждой
    const rows: [string, string][] = guides.map((g) => {
      const rad_bd = Number((g as any).radial ?? 0); // допустимая радиальная нагрузка
      const K = F <= 0 ? 0 : rad_bd / F;
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
