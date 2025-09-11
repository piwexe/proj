import { CalculateInput, CalculateResult } from '../dto/calculate.dto';

export interface CalculateStrategy {
  canHandle(input: CalculateInput): boolean;
  // было: calculate(input: CalculateInput): CalculateResult;
  calculate(input: CalculateInput): Promise<CalculateResult>;
}
