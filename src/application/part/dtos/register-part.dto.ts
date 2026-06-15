import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class RegisterPartDto {
  @ApiProperty({ example: 'Filtro de óleo' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'FLT-OL-001' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: 35.9 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;
}
