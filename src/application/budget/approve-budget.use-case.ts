import { Injectable } from '@nestjs/common';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { PartRepository } from '@domain/part/part-repository.port';
import { DomainException } from '@domain/shared';
import { BudgetResponseDto } from './dtos/budget-response.dto';

/**
 * Aprova o orcamento e da baixa no estoque das pecas (reserva).
 *
 * Regra de negocio (Estoque nao pode ficar negativo): antes de aprovar, o
 * sistema verifica a disponibilidade de TODAS as pecas do orcamento. Se
 * qualquer peca for insuficiente, a aprovacao e bloqueada com erro de dominio
 * (o admin precisa registrar entrada de estoque antes). Estando tudo
 * disponivel, o estoque e decrementado e o orcamento e vinculado a OS,
 * liberando a transicao para EM_EXECUCAO.
 */
@Injectable()
export class ApproveBudgetUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly partRepository: PartRepository,
  ) {}

  async execute(budgetId: string): Promise<BudgetResponseDto> {
    const budget = await this.budgetRepository.findById(budgetId);
    if (!budget) {
      throw DomainException.of(`Budget '${budgetId}' not found`);
    }

    // Quantidade total exigida por peca (uma peca pode aparecer em varias linhas).
    const requiredByPart = new Map<string, number>();
    for (const line of budget.lines) {
      if (line.type === 'PART') {
        requiredByPart.set(
          line.referenceId,
          (requiredByPart.get(line.referenceId) ?? 0) + line.quantity,
        );
      }
    }

    // Verifica disponibilidade ANTES de qualquer mutacao (estoque nao fica negativo).
    const parts = await Promise.all(
      [...requiredByPart.entries()].map(async ([partId, required]) => {
        const part = await this.partRepository.findById(partId);
        if (!part) {
          throw DomainException.of(`Part '${partId}' not found`);
        }
        if (part.stockQuantity < required) {
          throw DomainException.of(
            `Estoque insuficiente para a peca '${part.name}': ` +
              `disponivel=${part.stockQuantity}, necessario=${required}`,
          );
        }
        return { part, required };
      }),
    );

    budget.approve();

    // Baixa de estoque (reserva das pecas para a OS).
    for (const { part, required } of parts) {
      part.decrementStock(required);
      await this.partRepository.save(part);
    }

    await this.budgetRepository.save(budget);

    // Vincula o orcamento aprovado a OS, habilitando a transicao para EM_EXECUCAO.
    const serviceOrder = await this.serviceOrderRepository.findById(budget.serviceOrderId);
    if (serviceOrder) {
      serviceOrder.setBudget(budget.id);
      await this.serviceOrderRepository.save(serviceOrder);
    }

    return BudgetResponseDto.fromDomain(budget);
  }
}
