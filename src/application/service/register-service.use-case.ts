import { Injectable } from '@nestjs/common';
import { Service } from '@domain/service/service.entity';
import { ServiceRepository } from '@domain/service/service-repository.port';
import { DomainException } from '@domain/shared';
import { ServiceResponseDto } from './dtos/service-response.dto';

export interface RegisterServiceInput {
  name: string;
  basePrice: number;
  estimatedMinutes: number;
}

@Injectable()
export class RegisterServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(input: RegisterServiceInput): Promise<ServiceResponseDto> {
    const existing = await this.serviceRepository.findByName(input.name.trim());
    if (existing) {
      throw DomainException.of(`Service '${input.name}' already exists`);
    }

    const service = new Service({
      name: input.name,
      basePrice: input.basePrice,
      estimatedMinutes: input.estimatedMinutes,
    });

    await this.serviceRepository.save(service);

    return ServiceResponseDto.fromDomain(service);
  }
}
