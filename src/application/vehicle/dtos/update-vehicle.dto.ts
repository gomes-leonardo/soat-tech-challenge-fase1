import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateVehicleDto {
  @ApiPropertyOptional({ example: 'Honda' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'Civic' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;
}
