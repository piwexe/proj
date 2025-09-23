import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

@Injectable()
export class VariantNapr2Strategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const axialPlane = input.plane === 'flat' || input.plane === 'wall2';
    const hasEcc = !(input.l1 === 0 && input.l2 === 0 && input.l3 === 0);
    const twoGuide = input.guideCount === 2;             // napr = 2
    return axialPlane && hasEcc && twoGuide;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    
    if (input.carriageCount === 2 && input.l4 === 0) {
      throw new BadRequestException('для 2 кареток L4 должен быть > 0');
    }
    if (input.l5 === 0) {
      throw new BadRequestException('L5 должен быть > 0');
    }

    const m = input.mass;
    const napr = input.guideCount;     // = 2
    const karetki = input.carriageCount;
    const L1 = input.l1;
    const L2 = input.l2;
    const L4 = input.l4;
    const L5 = input.l5;

    // базовая осевая на 1 каретку
    const osev = (m * G) / (napr * karetki);

    let My  = 0;
    let osev2 = 0;
    let rad2  = 0;

    if (karetki === 2) {
      // две каретки на каждой направляющей
      if (L1 !== 0) rad2  = Math.abs((m * G * L1) / (karetki * L4));
      if (L2 !== 0) osev2 = Math.abs((m * G * L2) / (karetki * L5));
      My = 0;
    } else if (karetki === 1) {
      // одна каретка на направляющей
      if (L2 !== 0) My = Math.abs((m * G * L2) / napr); // napr = 2
      const nagL1 = L1 !== 0 ? Math.abs((m * G * L1) / (karetki * L5)) : 0;
      if (input.plane === 'flat') {
        // плашмя → воспринимаем как осевую
        osev2 = nagL1;
        rad2  = 0;
      } else if (input.plane === 'wall2') {
        // настенно друг напротив друга → воспринимаем как радиальную
        rad2  = nagL1;
        osev2 = 0;
      }
    }

    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    const rows: [string, string][] = guides.map((g) => {
      const My_bd       = Number((g as any).my     ?? 0);
      const osevaya_bd  = Number((g as any).axial  ?? 0); // осевая допустимая
      const radial_bd   = Number((g as any).radial ?? 0); // радиальная допустимая

      let sum = 0;
      if (My   > 0 && My_bd      > 0) sum += My   / My_bd;
      if (osev > 0 && osevaya_bd > 0) sum += osev / osevaya_bd;
      if (osev2> 0 && osevaya_bd > 0) sum += osev2/ osevaya_bd;
      if (rad2 > 0 && radial_bd  > 0) sum += rad2 / radial_bd;

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
      variant: 'variant-napr2',
      load: Number(osev.toFixed(3)),
      rows,
      notes: [
        `napr=2, karetki=${karetki}`,
        `My=${My.toFixed(3)} Н·м, osev=${osev.toFixed(3)} Н, osev2=${osev2.toFixed(3)} Н, rad2=${rad2.toFixed(3)} Н`,
      ],
    };
  }
}
