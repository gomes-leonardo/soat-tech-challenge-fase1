import { Injectable } from '@nestjs/common';
import { ServiceRepository } from '@domain/service/service-repository.port';
import { DomainException } from '@domain/shared';
import { ServiceResponseDto } from './dtos/service-response.dto';

export interface UpdateServiceInput {
  serviceId: string;
  name?: string;
  basePrice?: number;
  estimatedMinutes?: number;
}

@Injectable()
export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findById(input.serviceId);
    if (!service) {
      throw DomainException.of(`Service '${input.serviceId}' not found`);
    }

    if (input.name !== undefined) {
      service.updateName(input.name);
    }
    if (input.basePrice !== undefined) {
      service.updatePrice(input.basePrice);
    }
    if (input.estimatedMinutes !== undefined) {
      service.updateEstimatedTime(input.estimatedMinutes);
    }

    await this.serviceRepository.save(service);

    return ServiceResponseDto.fromDomain(service);
  }
}
