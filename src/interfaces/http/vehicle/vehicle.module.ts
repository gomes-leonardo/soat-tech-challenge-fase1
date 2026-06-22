import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleController } from './vehicle.controller';
import { RegisterVehicleUseCase } from '@application/vehicle/register-vehicle.use-case';
import { VehicleRepository } from '@domain/vehicle/vehicle-repository.port';
import { VehicleTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/vehicle.typeorm-repository';
import { VehicleOrmEntity } from '@infrastructure/database/typeorm/entities/vehicle.orm-entity';
import { ClientModule } from '@interfaces/http/client/client.module';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleOrmEntity]), ClientModule],
  controllers: [VehicleController],
  providers: [
    RegisterVehicleUseCase,
    {
      provide: VehicleRepository,
      useClass: VehicleTypeOrmRepository,
    },
  ],
  exports: [VehicleRepository],
})
export class VehicleModule {}
