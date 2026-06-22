import { Injectable } from '@nestjs/common';
import { Budget } from '@domain/budget/budget.entity';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { BudgetResponseDto } from './dtos/budget-response.dto';

export interface CreateBudgetInput {
  serviceOrderId: string;
  lines: Array<{
    type: 'SERVICE' | 'PART';
    referenceId: string;
    description: string;
    quantity: number;
    frozenUnitPrice: number;
  }>;
}

@Injectable()
export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: BudgetRepository) {}

  async execute(input: CreateBudgetInput): Promise<BudgetResponseDto> {
    // Check if there's a previous budget for this SO (re-budget scenario)
    const existing = await this.budgetRepository.findLatestByServiceOrderId(input.serviceOrderId);

    let budget: Budget;

    if (existing) {
      // Re-budget: create new version
      budget = Budget.createNewVersion(existing, input.lines);
    } else {
      budget = new Budget({
        serviceOrderId: input.serviceOrderId,
        lines: input.lines,
      });
    }

    await this.budgetRepository.save(budget);

    return BudgetResponseDto.fromDomain(budget);
  }
}
