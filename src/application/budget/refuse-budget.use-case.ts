import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { DomainException } from '@domain/shared';
import { BudgetResponseDto } from './dtos/budget-response.dto';

@Injectable()
export class RefuseBudgetUseCase {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  async execute(budgetId: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw DomainException.of(`Budget '${budgetId}' not found`);
    }

    budget.refuse();
    await this.budgetRepository.save(budget);

    return BudgetResponseDto.fromDomain(budget);
  }
}
