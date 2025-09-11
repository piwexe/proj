import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CalcInputDto {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isCompact: boolean;

  @Transform(({ value }) => Number(value)) @IsNumber()
  mass: number;                 // m (кг)

  @Transform(({ value }) => Number(value)) @IsNumber() l1: number;
  @Transform(({ value }) => Number(value)) @IsNumber() l2: number;
  @Transform(({ value }) => Number(value)) @IsNumber() l3: number;
  @Transform(({ value }) => Number(value)) @IsNumber() l4: number;
  @Transform(({ value }) => Number(value)) @IsNumber() l5: number;

  @Transform(({ value }) => Number(value)) @IsNumber()
  maxTemperature: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  aggressiveEnv: boolean;

  @Transform(({ value }) => Number(value)) @IsNumber()
  guideCount: number;           // napr

  @Transform(({ value }) => Number(value)) @IsNumber()
  carriageCount: number;        // karetki

  @IsString()
  plane: string;                // 'flat', 'wall2', ...
}
