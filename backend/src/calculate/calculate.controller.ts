import { Body, Controller, Post } from '@nestjs/common';
import { CalculateService } from './calculate.service';
import { CalcInputDto } from './dto/calc-input.dto';

@Controller('calculate')
export class CalculateController {
  constructor(private readonly service: CalculateService) {}

  @Post()
  async calculate(@Body() dto: CalcInputDto) {
    return this.service.calculate(dto); // вернёт массив [code, value]
  }
}
