import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { DomainException } from '@domain/shared';
import { BudgetResponseDto } from './dtos/budget-response.dto';

/**
 * Recusa o orcamento. Efeito de status (automatico): se a OS estiver
 * AGUARDANDO_APROVACAO, ela e encerrada sem execucao (cliente recusou o
 * orcamento, veiculo devolvido sem reparo).
 */
@Injectable()
export class RefuseBudgetUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(budgetId: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw DomainException.of(`Budget '${budgetId}' not found`);
    }

    budget.refuse();
    await this.budgetRepository.save(budget);

    const serviceOrder = await this.serviceOrderRepository.findById(budget.serviceOrderId);
    if (serviceOrder && serviceOrder.status === ServiceOrderStatus.AGUARDANDO_APROVACAO) {
      serviceOrder.changeStatus(ServiceOrderStatus.ENCERRADA_SEM_EXECUCAO, 'system');
      await this.serviceOrderRepository.save(serviceOrder);
    }

    return BudgetResponseDto.fromDomain(budget);
  }
}
