import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

/**
 * napr = 2, karetki = 2, расположение НЕ вертикальное.
 *
 * Формулы:
 *   rad  = m*g / (napr * karetki)  (базовая радиальная)
 *   nagL2 = |m*g*L2| / (karet ki * L4)     (распределённая из-за L2)
 *   nagL1 = |m*g*L1| / (karetki * L5)     (распределённая из-за L1)
 *
 * Ветвление по plane:
 *   - 'horizontal' (горизонтально ДНПД):   rad2 = nagL1 + nagL2; osev2 = 0
 *   - 'wall2' (настенно ДНПД) ИЛИ всё прочее не-вертикальное: osev2 = nagL1; rad2 = nagL2
 *
 * K = 1 / ( rad/radial_bd + osev2/axial_bd + rad2/radial_bd )
 */
@Injectable()
export class VariantNapr2NonVerticalStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const isNonVertical = input.plane === 'wall' || input.plane === 'vertical2' || input.plane === 'horizontal';
    return input.guideCount === 2 && input.carriageCount === 2 && isNonVertical;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    if (input.l2 !== 0 && input.l4 === 0)
      throw new BadRequestException('для 2 кареток и 2 направляющих при L2 != 0, L4 должен быть > 0');
    if (input.l1 !== 0 && input.l5 === 0)
      throw new BadRequestException('для 2 кареток и 2 направляющих при L1 != 0, L5 должен быть > 0');

    const m = input.mass;
    const karetki = input.carriageCount; // =2
    const napr = input.guideCount;       // =2
    const L1 = input.l1;
    const L2 = input.l2;
    const L4 = input.l4;
    const L5 = input.l5;
    let nagL1 = 0;
    let nagL2 = 0;
    let rad2 = 0;
    let osev2 = 0;

    const rad = (m * G) / (napr * karetki); // = m*g/4

    if (L2 === 0) {
      nagL2 = 0;
    } else if (L2 !== 0) {
      nagL2 = Math.abs((m * G * L2) / (karetki * L4));
    }
    if (L1 === 0) {
      nagL1 === 0;
    } else if (L1 !== 0) {
      nagL1 = Math.abs((m * G * L1) / (karetki * L5));
    }

    if (input.plane === 'horizontal') {
      rad2 = nagL1 + nagL2;
      osev2 = 0;
    } else if (input.plane === 'wall' || input.plane === 'vertical2'){
      osev2 = nagL1;
      rad2 = nagL2;
    }

    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    const rows: [string, string][] = guides.map((g) => {
      const radial_bd = Number((g as any).radialnaya ?? 0);
      const axial_bd = Number((g as any).axial ?? 0);

      let sum = 0;
      if (rad > 0 && radial_bd > 0) sum += rad / radial_bd;
      if (osev2 > 0 && axial_bd > 0) sum += osev2 / axial_bd;
      if (rad2 > 0 && radial_bd > 0) sum += rad2 / radial_bd;

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
      variant: 'variant-napr2-non-vertical',
      load: Number(rad.toFixed(3)), // базовая радиальная (для консистентности с остальными стратегиями)
      rows,
      notes: [
        `karetki=2, napr=2, plane=${input.plane}`,
        `nagL1=${nagL1.toFixed(3)} Н, nagL2=${nagL2.toFixed(3)} Н`,
        `rad2=${rad2.toFixed(3)} Н, osev2=${osev2.toFixed(3)} Н`,
      ],
    } as CalculateResult & { rows: [string, string][] };
  }
}
