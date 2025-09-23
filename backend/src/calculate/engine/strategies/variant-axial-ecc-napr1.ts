import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CalculateStrategy } from '../strategy.interface';
import { CalculateInput, CalculateResult } from '../../dto/calculate.dto';
import { RollerGuide } from '../../../db/entities/roller-guide.entity';

const G = 9.806; // м/с²

@Injectable()
export class VariantAxialEccNapr1Strategy implements CalculateStrategy {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  canHandle(input: CalculateInput): boolean {
    const axialPlane = input.plane === 'flat' || input.plane === 'wall2';
    const hasEcc = !(input.l1 === 0 && input.l2 === 0 && input.l3 === 0);
    const oneGuide = input.guideCount === 1;             // napr = 1
    return axialPlane && hasEcc && oneGuide;
  }

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    
    if (input.carriageCount === 2 && input.l4 === 0) {
      throw new BadRequestException('для 2 кареток L4 должен быть > 0');
    }

    const m = input.mass;
    const karetki = input.carriageCount;
    const L1 = input.l1;
    const L2 = input.l2;

    // базовая осевая на одну каретку (napr=1 => делим только на karetki)
    const F = (m * G) / karetki;

    // эксцентриситет
    let Mx = 0;
    let My = 0;
    let osev2 = 0;

    if (L1 !== 0) {
      Mx = Math.abs((m * G * L1) / karetki);
    }

    if (karetki === 1) {
      // одна каретка → момент по Y
      if (L2 !== 0) {
        My = Math.abs(m * G * L2);
      }
      osev2 = 0;
    } else if (karetki === 2) {
      // две каретки → «вторая осевая», момент Y не учитываем
      My = 0;
      if (L2 !== 0) {
        osev2 = Math.abs((m * G * L2) / (karetki * input.l4));
      }
    }

    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    const rows: [string, string][] = guides.map((g) => {
      const Mx_bd = Number((g as any).mx ?? 0);
      const My_bd = Number((g as any).my ?? 0);
      const osevaya_bd = Number((g as any).axial ?? 0);

      let sum = 0;
      if (Mx > 0 && Mx_bd > 0) sum += Mx / Mx_bd;
      if (My > 0 && My_bd > 0) sum += My / My_bd;
      if (F > 0 && osevaya_bd > 0) sum += F / osevaya_bd;
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
      variant: 'variant-axial-ecc-napr1',
      load: Number(F.toFixed(3)), // базовая осевая на 1 каретку, Н
      rows,
      notes: [
        `napr=1, karetki=${karetki}`,
        `Mx=${Mx.toFixed(3)} Н·м, My=${My.toFixed(3)} Н·м, osev2=${osev2.toFixed(3)} Н`,
      ],
    };
  }
}
