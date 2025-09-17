import { CalculateInput, CalculateResult } from '../dto/calculate.dto';

export interface CalculateStrategy {
  canHandle(input: CalculateInput): boolean;
  calculate(input: CalculateInput): Promise<CalculateResult>;
}
