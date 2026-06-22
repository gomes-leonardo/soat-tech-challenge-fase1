import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Troca de óleo sintético' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 180.0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  estimatedMinutes?: number;
}
