import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdatePartDto {
  @ApiPropertyOptional({ example: 'Filtro de óleo premium' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 45.9 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  unitPrice?: number;
}
