import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalculateController, CalculateService } from './calculate';
import { RollerGuide } from './db/entities/roller-guide.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '2002',
      database: 'compact_caretki',
      entities: [RollerGuide],
      synchronize: false, // лучше false в продакшене
    }),
    TypeOrmModule.forFeature([RollerGuide]),
  ],
  controllers: [CalculateController],
  providers: [CalculateService],
})
export class AppModule {}
