import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

@Injectable()
export class VariantNapr2NonVerticalStrategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const isNonVertical = input.plane === 'wall' || input.plane === 'vertical2' || input.plane === 'horizontal';
    return ((input.guideCount === 1 && input.carriageCount === 1) ||
    (input.guideCount === 1 && input.carriageCount === 2) ||
    (input.guideCount === 2 && input.carriageCount === 1)) && isNonVertical;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    if (input.guideCount === 2 && input.l5 === 0)
      throw new BadRequestException('для 2 кареток L5 должен быть > 0');
    
    const m = input.mass;
    const karetki = input.carriageCount; 
    const napr = input.guideCount;       
    const L1 = input.l1;
    const L2 = input.l2;
    const L5 = input.l5;
    let Mzs = 0;
    let Mzd = 0;
    let Mx = 0;
    let My = 0;
    let nagL1 = 0;
    let rad2 = 0;
    let osev2 = 0;

    const rad = (m * G) / (napr * karetki); 

    if (L2 === 0) {
      Mzd = 0;
      Mzs = 0;
    } else if (L2 > 0) {
      Mzs = Math.abs((m * G * L2) / karetki); // Радиальный момент
      Mzd = 0;
    } else if (L2 < 0) {
      Mzd = Math.abs((m * G * L2) / karetki); // Момент при настенном расположении
      Mzs = 0;
    } 
    if (napr === 1) {
      Mx = Math.abs((m * G * L1) / karetki);
      My = 0;
    } else if (napr === 2) {
      nagL1 = Math.abs((m * G * L1) / (karetki * L5));
      My = 0;
      Mx = 0;
      if (input.plane === 'wall'){
        osev2 = nagL1;
      } else if (input.plane === 'vertical2'|| input.plane === 'horizontal'){
        rad2 = nagL1;
      }
    }

    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    const rows: [string, string][] = guides.map((g) => {
      const radial_bd = Number((g as any).radialnaya ?? 0);
      const axial_bd = Number((g as any).axial ?? 0);
      const My_bd = Number((g as any).my ?? 0);
      const Mx_bd = Number((g as any).mx ?? 0);
      const Mzs_bd = Number((g as any).mzs ?? 0);
      const Mzd_bd = Number((g as any).mzd ?? 0);

      let sum = 0;
      if (rad > 0 && radial_bd > 0) sum += rad / radial_bd;
      if (osev2 > 0 && axial_bd > 0) sum += osev2 / axial_bd;
      if (rad2 > 0 && radial_bd > 0) sum += rad2 / radial_bd;
      if (Mx > 0 && Mx_bd > 0) sum += Mx / Mx_bd;
      if (My > 0 && My_bd > 0) sum += My / My_bd;
      if (Mzs > 0 && Mzs_bd > 0) sum += Mzs / Mzs_bd;
      if (Mzd > 0 && Mzd_bd > 0) sum += Mzd / Mzd_bd;

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
      load: Number(rad.toFixed(3)), 
      rows,
      notes: [
        `karetki=2, napr=2, plane=${input.plane}`,
        `nagL1=${nagL1.toFixed(3)}`,
        `rad2=${rad2.toFixed(3)} Н, osev2=${osev2.toFixed(3)} Н, Mx=${Mx.toFixed(3)} Н·м, My=${My.toFixed(3)} Н·м, Mzs=${Mzs.toFixed(3)} Н·м, Mzd=${Mzd.toFixed(3)} Н·м`,
      ],
    } as CalculateResult & { rows: [string, string][] };
  }
}
