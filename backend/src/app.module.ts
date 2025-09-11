import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CalculateController } from './calculate/calculate.controller';
import { CalculateService } from './calculate/calculate.service';
import { RollerGuide } from './db/entities/roller-guide.entity';

import { EngineService } from './calculate/engine/engine.service';
import { CALC_STRATEGIES } from './calculate/engine/tokens';
import { VariantCompactFlatStrategy } from './calculate/engine/strategies/variant-compact-flat';

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
    VariantCompactFlatStrategy,

    // токен с массивом стратегий
    {
      provide: CALC_STRATEGIES,
      useFactory: (compactFlat: VariantCompactFlatStrategy) => [
        compactFlat,
        // сюда добавятся новые стратегии
      ],
      inject: [VariantCompactFlatStrategy],
    },
  ],
})
export class AppModule {}
