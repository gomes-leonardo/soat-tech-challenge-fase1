import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateServiceOrderDto {
  @ApiProperty({ description: 'ID do cliente' })
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @ApiPropertyOptional({ description: 'ID do veículo (opcional)' })
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @ApiProperty({ description: 'Descrição do serviço solicitado', example: 'Troca de óleo e filtro' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
