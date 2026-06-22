import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { DomainException } from '@domain/shared';
import { BudgetResponseDto } from './dtos/budget-response.dto';

@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(budgetId: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw DomainException.of(`Budget '${budgetId}' not found`);
    }

    budget.approve();
    await this.budgetRepository.save(budget);

    // Wire: set budgetId on the service order so it can transition to EM_EXECUCAO
    const serviceOrder = await this.serviceOrderRepository.findById(budget.serviceOrderId);
    if (serviceOrder) {
      serviceOrder.setBudget(budget.id);
      await this.serviceOrderRepository.save(serviceOrder);
    }

    return BudgetResponseDto.fromDomain(budget);
  }
}
