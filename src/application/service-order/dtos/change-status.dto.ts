import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

export class ChangeStatusDto {
  @ApiProperty({
    enum: ServiceOrderStatus,
    description: 'Novo status da ordem de serviço',
    example: ServiceOrderStatus.EM_DIAGNOSTICO,
  })
  @IsEnum(ServiceOrderStatus)
  @IsNotEmpty()
  status!: ServiceOrderStatus;

  @ApiProperty({ description: 'ID do administrador realizando a alteração' })
  @IsString()
  @IsNotEmpty()
  changedBy!: string;
}
