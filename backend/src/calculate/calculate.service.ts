import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RollerGuide } from '../db/entities/roller-guide.entity';
import { CalcInputDto } from './dto/calc-input.dto';

const G = 9.806; // м/с²

@Injectable()
export class CalculateService {
  constructor(
    @InjectRepository(RollerGuide)
    private readonly guideRepo: Repository<RollerGuide>,
  ) {}

  /**
   * Первая ветка алгоритма:
   *  - plane = 'flat' (плашмя) ИЛИ 'wall2' (настенно: друг напротив друга)
   *  - L1 = L2 = L3 = 0
   *  - считаем осевую нагрузку F = (m * 9.806) / (napr * karetki)
   *  - для КАЖДОЙ каретки из БД считаем K = Fmax / F, где Fmax = osevaya
   *  - возвращаем массив [code, K] в строковом формате с запятой
   */
  async calculate(dto: CalcInputDto) {
    const planeIsAxial = dto.plane === 'flat' || dto.plane === 'wall2';
    const noEccentricity = dto.l1 === 0 && dto.l2 === 0 && dto.l3 === 0;

    if (!planeIsAxial || !noEccentricity) {
      // Здесь позже подключим другие ветки (радиальная, с эксцентриситетом и т.д.)
      throw new BadRequestException('Данная ветка ещё не реализована для указанных условий.');
    }

    // проверки входных
    if (dto.mass <= 0) throw new BadRequestException('mass должен быть > 0');
    if (dto.guideCount <= 0) throw new BadRequestException('guideCount должен быть > 0');
    if (dto.carriageCount <= 0) throw new BadRequestException('carriageCount должен быть > 0');

    // 1) осевая нагрузка на ОДНУ каретку
    // F = (m * g) / (napr * karetki)
    const F = (dto.mass * G) / (dto.guideCount * dto.carriageCount);

    // 2) берём все направляющие из БД (название + осевая допустимая)
    const guides = await this.guideRepo.find({ order: { name: 'ASC' } });

    // 3) считаем K = Fmax / F для каждой; форматируем «1,23»
    const rows: [string, string][] = guides.map(g => {
      const Fmax = Number(g.axial ?? 0); // osevaya
      const K = F <= 0 ? 0 : Fmax / F;
      const formatted = K.toFixed(2).replace('.', ',');
      return [g.name, formatted];
    });

    // по желанию: сортировка по убыванию запаса
    rows.sort((a, b) => parseFloat(b[1].replace(',', '.')) - parseFloat(a[1].replace(',', '.')));

    // фронт ждёт массив пар
    return rows;
  }
}
