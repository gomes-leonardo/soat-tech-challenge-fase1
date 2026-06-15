import { Injectable } from '@nestjs/common';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ClientRepository } from '@domain/client/client-repository.port';
import { DomainException } from '@domain/shared';
import { ServiceOrderResponseDto } from './dtos/service-order-response.dto';

export interface CreateServiceOrderInput {
  clientId: string;
  vehicleId?: string;
  description: string;
}

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrderResponseDto> {
    const client = await this.clientRepository.findById(input.clientId);
    if (!client) {
      throw DomainException.of(`Client with id '${input.clientId}' not found`);
    }

    const serviceOrder = new ServiceOrder({
      clientId: input.clientId,
      vehicleId: input.vehicleId,
      description: input.description,
    });

    await this.serviceOrderRepository.save(serviceOrder);

    return ServiceOrderResponseDto.fromDomain(serviceOrder);
  }
}
