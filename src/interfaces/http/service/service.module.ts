import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceController } from './service.controller';
import { RegisterServiceUseCase } from '@application/service/register-service.use-case';
import { UpdateServiceUseCase } from '@application/service/update-service.use-case';
import { ServiceRepository } from '@domain/service/service-repository.port';
import { ServiceTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/service.typeorm-repository';
import { ServiceOrmEntity } from '@infrastructure/database/typeorm/entities/service.orm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOrmEntity])],
  controllers: [ServiceController],
  providers: [
    RegisterServiceUseCase,
    UpdateServiceUseCase,
    {
      provide: ServiceRepository,
      useClass: ServiceTypeOrmRepository,
    },
  ],
  exports: [ServiceRepository],
})
export class ServiceModule {}
