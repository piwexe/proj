import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CalculateController } from './calculate/calculate.controller';
import { CalculateService } from './calculate/calculate.service';
import { RollerGuide } from './db/entities/roller-guide.entity';

import { EngineService } from './calculate/engine/engine.service';
import { CALC_STRATEGIES } from './calculate/engine/tokens';
import { VariantCompactFlatStrategy } from './calculate/engine/strategies/variant-compact-flat';
import { VariantAxialEccNapr1Strategy } from './calculate/engine/strategies/variant-axial-ecc-napr1';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST'),
        port: config.get<number>('POSTGRES_PORT'),
        username: config.get<string>('POSTGRES_USER'),
        password: config.get<string>('POSTGRES_PASSWORD'),
        database: config.get<string>('POSTGRES_DB'),
        entities: [RollerGuide],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([RollerGuide]),
  ],
  controllers: [CalculateController],
  providers: [
    CalculateService,
    EngineService,
    // регистрируем стратегии как провайдеры
    VariantAxialEccNapr1Strategy,
    VariantCompactFlatStrategy,
    // токен с массивом стратегий
    {
      provide: CALC_STRATEGIES,
      useFactory: (
        axialEccNapr1: VariantAxialEccNapr1Strategy,
        compactFlat: VariantCompactFlatStrategy,
      ) => [
        axialEccNapr1, // более специфичная сначала (napr=1 + эксцентриситет)
        compactFlat,   // базовая «осевая без эксцентриситета»
      ],
      inject: [VariantAxialEccNapr1Strategy, VariantCompactFlatStrategy],
    },
  ],
})
export class AppModule {}
