import { Injectable } from '@nestjs/common';
import { PartRepository } from '@domain/part/part-repository.port';
import { DomainException } from '@domain/shared';
import { PartResponseDto } from './dtos/part-response.dto';

export interface AdjustStockInput {
  partId: string;
  quantity: number; // positive = increment, negative = decrement
}

@Injectable()
export class AdjustStockUseCase {
  constructor(private readonly partRepository: PartRepository) {}

  async execute(input: AdjustStockInput): Promise<PartResponseDto> {
    const part = await this.partRepository.findById(input.partId);
    if (!part) {
      throw DomainException.of(`Part '${input.partId}' not found`);
    }

    if (input.quantity > 0) {
      part.incrementStock(input.quantity);
    } else if (input.quantity < 0) {
      part.decrementStock(Math.abs(input.quantity));
    } else {
      throw DomainException.of('Quantity adjustment cannot be zero');
    }

    await this.partRepository.save(part);

    return PartResponseDto.fromDomain(part);
  }
}
