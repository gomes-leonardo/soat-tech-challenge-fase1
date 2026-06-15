import { ApiProperty } from '@nestjs/swagger';
import { Part } from '@domain/part/part.entity';

export class PartResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  stockQuantity!: number;

  static fromDomain(part: Part): PartResponseDto {
    const dto = new PartResponseDto();
    dto.id = part.id;
    dto.name = part.name;
    dto.sku = part.sku;
    dto.unitPrice = part.unitPrice;
    dto.stockQuantity = part.stockQuantity;
    return dto;
  }
}
