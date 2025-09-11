import { Body, Controller, Post } from '@nestjs/common';
import { CalculateService } from './calculate.service';
import { CalcInputDto, CalculateResult } from './dto/calculate.dto';

@Controller('calculate')
export class CalculateController {
  constructor(private readonly service: CalculateService) {}

  @Post()
  async run(@Body() input: CalcInputDto): Promise<CalculateResult> {
    return this.service.run(input);
  }
}
