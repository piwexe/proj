import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export type PlaneType = 'flat' | 'upright' | 'other' | string;

export interface CalculateResult {
  ok: boolean;
  variant: string;
  load?: number;
  rows?: [string, string][];
  notes?: string[];
}

/**
 * Интерфейс, который ожидают стратегии/engine.
 * Наш DTO ниже "реализует" этот контракт по факту полями.
 */
export interface CalculateInput {
  isCompact: boolean;
  mass: number;
  l1: number;
  l2: number;
  l3: number;
  l4: number;
  l5: number;
  maxTemperature: number;
  aggressiveEnv: boolean;
  guideCount: number;
  carriageCount: number;
  plane: PlaneType;
}

/**
 * Твой исходный DTO с трансформами — оставляем.
 * Благодаря глобальному ValidationPipe({ transform: true })
 * строки из запроса превратятся в числа/булевы до входа в сервис.
 */
export class CalcInputDto implements CalculateInput {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isCompact: boolean;

  @Transform(({ value }) => Number(value)) @IsNumber()
  mass: number; // m (кг)

  @Transform(({ value }) => Number(value)) @IsNumber()
  l1: number;
  @Transform(({ value }) => Number(value)) @IsNumber()
  l2: number;
  @Transform(({ value }) => Number(value)) @IsNumber()
  l3: number;
  @Transform(({ value }) => Number(value)) @IsNumber()
  l4: number;
  @Transform(({ value }) => Number(value)) @IsNumber()
  l5: number;

  @Transform(({ value }) => Number(value)) @IsNumber()
  maxTemperature: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  aggressiveEnv: boolean;

  @Transform(({ value }) => Number(value)) @IsNumber()
  guideCount: number; // направляющих

  @Transform(({ value }) => Number(value)) @IsNumber()
  carriageCount: number; // кареток

  @IsString()
  plane: PlaneType; // 'flat', 'upright', ...
}
