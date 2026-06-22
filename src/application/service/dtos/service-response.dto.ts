import { ApiProperty } from '@nestjs/swagger';
import { Service } from '@domain/service/service.entity';

export class ServiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  basePrice!: number;

  @ApiProperty()
  estimatedMinutes!: number;

  static fromDomain(service: Service): ServiceResponseDto {
    const dto = new ServiceResponseDto();
    dto.id = service.id;
    dto.name = service.name;
    dto.basePrice = service.basePrice;
    dto.estimatedMinutes = service.estimatedMinutes;
    return dto;
  }
}
