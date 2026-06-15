import { Injectable } from '@nestjs/common';
import { Part } from '@domain/part/part.entity';
import { PartRepository } from '@domain/part/part-repository.port';
import { DomainException } from '@domain/shared';
import { PartResponseDto } from './dtos/part-response.dto';

export interface RegisterPartInput {
  name: string;
  sku: string;
  unitPrice: number;
  stockQuantity: number;
}

@Injectable()
export class RegisterPartUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(input: RegisterPartInput): Promise<PartResponseDto> {
    const existing = await this.partRepository.findBySku(input.sku.toUpperCase());
    if (existing) {
      throw DomainException.of(`Part with SKU '${input.sku}' already exists`);
    }

    const part = new Part({
      name: input.name,
      sku: input.sku,
      unitPrice: input.unitPrice,
      stockQuantity: input.stockQuantity,
    });

    await this.partRepository.save(part);

    return PartResponseDto.fromDomain(part);
  }
}
