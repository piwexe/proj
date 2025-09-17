import { Injectable } from '@nestjs/common';
import { EngineService } from './engine/engine.service';
import { CalculateInput, CalculateResult } from './dto/calculate.dto';

@Injectable()
export class CalculateService {
  constructor(private readonly engine: EngineService) {}

  async run(input: CalculateInput): Promise<CalculateResult> {
    return this.engine.calculate(input);
  }
}
