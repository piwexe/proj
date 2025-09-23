import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, IsInt, IsEnum, IsIn, Min} from 'class-validator';

export enum PlaneEnum {
  flat = 'flat',
  vertical1 = 'vertical1',
  horizontal = 'horizontal',
  wall = 'wall',
  vertical2 = 'vertical2',
  wall2 = 'wall2',
}

export type PlaneType = PlaneEnum; // алиас на enum:

export interface CalculateResult {
  ok: boolean;
  variant: string;
  load?: number;
  rows?: [string, string][];
  notes?: string[];
}

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

export class CalcInputDto implements CalculateInput {
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isCompact: boolean;

  @Transform(({ value }) => Number(value))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'mass должен быть числом' },
  )
  @Min(0.000001, { message: 'mass должен быть > 0' })
  mass: number; // кг

 @Transform(({ value }) => Number(value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'l1 число' })
  @Min(0, { message: 'l1 не может быть отрицательным' })
  l1: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'l2 число' })
  @Min(0, { message: 'l2 не может быть отрицательным' })
  l2: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'l3 число' })
  @Min(0, { message: 'l3 не может быть отрицательным' })
  l3: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'l4 число' })
  @Min(0, { message: 'l4 не может быть отрицательным' })
  l4: number;

  @Transform(({ value }) => Number(value))
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'l5 число' })
  @Min(0, { message: 'l5 не может быть отрицательным' })
  l5: number;

  @Transform(({ value }) => Number(value))
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'maxTemperature должно быть числом' },
  )
  maxTemperature: number;

  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  aggressiveEnv: boolean;

  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'guideCount должен быть целым числом' })
  @IsIn([1, 2], { message: 'guideCount должен быть 1 или 2' })
  guideCount: number; // направляющих

  @Transform(({ value }) => Number(value))
  @IsInt({ message: 'carriageCount должен быть целым числом' })
  @IsIn([1, 2], { message: 'carriageCount должен быть 1 или 2' })
  carriageCount: number; // кареток

  @IsString()
  @IsEnum(PlaneEnum, {
    message: `plane должно быть одним из: ${Object.values(PlaneEnum).join(', ')}`,
  })
  plane: PlaneEnum;
}
