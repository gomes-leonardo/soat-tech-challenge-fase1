import { Injectable } from '@nestjs/common';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { DomainException } from '@domain/shared';
import { ServiceOrderResponseDto } from './dtos/service-order-response.dto';

export interface ChangeServiceOrderStatusInput {
  serviceOrderId: string;
  newStatus: ServiceOrderStatus;
  changedBy: string;
}

@Injectable()
export class ChangeServiceOrderStatusUseCase {
  constructor(private readonly serviceOrderRepository: ServiceOrderRepository) {}

  async execute(input: ChangeServiceOrderStatusInput): Promise<ServiceOrderResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(input.serviceOrderId);
    if (!serviceOrder) {
      throw DomainException.of(`Service order '${input.serviceOrderId}' not found`);
    }

    serviceOrder.changeStatus(input.newStatus, input.changedBy);

    await this.serviceOrderRepository.save(serviceOrder);

    return ServiceOrderResponseDto.fromDomain(serviceOrder);
  }
}
