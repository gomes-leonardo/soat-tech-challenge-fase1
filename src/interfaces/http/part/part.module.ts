import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartController } from './part.controller';
import { RegisterPartUseCase } from '@application/part/register-part.use-case';
import { AdjustStockUseCase } from '@application/part/adjust-stock.use-case';
import { PartRepository } from '@domain/part/part-repository.port';
import { PartTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/part.typeorm-repository';
import { PartOrmEntity } from '@infrastructure/database/typeorm/entities/part.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([PartOrmEntity])],
  controllers: [PartController],
  providers: [
    RegisterPartUseCase,
    AdjustStockUseCase,
    {
      provide: PartRepository,
      useClass: PartTypeOrmRepository,
    },
  ],
  exports: [PartRepository],
})
export class PartModule {}
