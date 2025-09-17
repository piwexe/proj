import { Inject, Injectable, Logger } from '@nestjs/common';
import { CalculateInput, CalculateResult } from '../dto/calculate.dto';
import { CalculateStrategy } from './strategy.interface';
import { CALC_STRATEGIES } from './tokens';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    @Inject(CALC_STRATEGIES)
    private readonly strategies: CalculateStrategy[],
  ) {}

  async calculate(input: CalculateInput): Promise<CalculateResult> {
    const strategy = this.strategies.find(s => s.canHandle(input));

    if (!strategy) {
      this.logger.warn(`Нет стратегии для: isCompact=${input.isCompact}, plane=${input.plane}`);
      return { ok: false, variant: 'unknown', notes: ['Не найдена подходящая стратегия'] };
    }
    return strategy.calculate(input); // здесь уже Promise
  }
}
