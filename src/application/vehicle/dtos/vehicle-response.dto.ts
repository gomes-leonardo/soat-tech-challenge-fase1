import { ApiProperty } from '@nestjs/swagger';
import { Vehicle } from '@domain/vehicle/vehicle.entity';

export class VehicleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  plate!: string;

  @ApiProperty()
  brand!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  ownerClientId!: string;

  static fromDomain(vehicle: Vehicle): VehicleResponseDto {
    const dto = new VehicleResponseDto();
    dto.id = vehicle.id;
    dto.plate = vehicle.plate.value;
    dto.brand = vehicle.brand;
    dto.model = vehicle.model;
    dto.year = vehicle.year;
    dto.ownerClientId = vehicle.ownerClientId;
    return dto;
  }
}
