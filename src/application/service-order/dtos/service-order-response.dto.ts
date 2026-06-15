import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { StatusHistoryEntry } from '@domain/service-order/status-history.vo';

export class ServiceOrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clientId!: string;

  @ApiPropertyOptional()
  vehicleId!: string | null;

  @ApiProperty()
  description!: string;

  @ApiProperty({ enum: ServiceOrderStatus })
  status!: ServiceOrderStatus;

  @ApiPropertyOptional()
  budgetId!: string | null;

  @ApiProperty({ type: 'array' })
  statusHistory!: StatusHistoryEntry[];

  static fromDomain(so: ServiceOrder): ServiceOrderResponseDto {
    const dto = new ServiceOrderResponseDto();
    dto.id = so.id;
    dto.clientId = so.clientId;
    dto.vehicleId = so.vehicleId;
    dto.description = so.description;
    dto.status = so.status;
    dto.budgetId = so.budgetId;
    dto.statusHistory = so.statusHistory.toJSON();
    return dto;
  }
}
