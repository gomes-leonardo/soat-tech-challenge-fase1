import { Injectable } from '@nestjs/common';
import { Budget } from '@domain/budget/budget.entity';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceRepository } from '@domain/service/service-repository.port';
import { PartRepository } from '@domain/part/part-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { DomainException } from '@domain/shared';
import { BudgetResponseDto } from './dtos/budget-response.dto';

export interface CreateBudgetInput {
  serviceOrderId: string;
  lines: Array<{
    type: 'SERVICE' | 'PART';
    referenceId: string;
    quantity: number;
  }>;
}

interface ResolvedLine {
  type: 'SERVICE' | 'PART';
  referenceId: string;
  description: string;
  quantity: number;
  frozenUnitPrice: number;
}

/**
 * Gera o orcamento AUTOMATICAMENTE a partir do catalogo: para cada linha o
 * sistema busca o servico/peca pelo referenceId, valida a existencia e congela
 * o preco atual (Service.basePrice / Part.unitPrice). O cliente da API nao
 * informa preco nem descricao — eles vem do catalogo, garantindo o
 * "price freezing" e impedindo precos arbitrarios.
 *
 * Efeito de status (automatico): ao gerar o orcamento, a OS avanca para
 * AGUARDANDO_APROVACAO. No reorcamento (OS em EM_EXECUCAO) ela retorna para
 * AGUARDANDO_APROVACAO e o vinculo do orcamento anterior e limpo.
 */
@Injectable()
export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: BudgetRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly partRepository: PartRepository,
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(input: CreateBudgetInput): Promise<BudgetResponseDto> {
    const serviceOrder = await this.serviceOrderRepository.findById(input.serviceOrderId);
    if (!serviceOrder) {
      throw DomainException.of(`Service order '${input.serviceOrderId}' not found`);
    }

    if (!input.lines || input.lines.length === 0) {
      throw DomainException.of('At least one budget line is required');
    }

    const resolvedLines = await this.resolveLines(input.lines);

    const existing = await this.budgetRepository.findLatestByServiceOrderId(input.serviceOrderId);

    const budget = existing
      ? Budget.createNewVersion(existing, resolvedLines)
      : new Budget({ serviceOrderId: input.serviceOrderId, lines: resolvedLines });

    await this.budgetRepository.save(budget);

    this.advanceToAwaitingApproval(serviceOrder);
    await this.serviceOrderRepository.save(serviceOrder);

    return BudgetResponseDto.fromDomain(budget);
  }

  /** Busca preco/descricao do catalogo e congela o preco no momento da geracao. */
  private async resolveLines(lines: CreateBudgetInput['lines']): Promise<ResolvedLine[]> {
    return Promise.all(
      lines.map(async (line) => {
        if (line.type === 'SERVICE') {
          const service = await this.serviceRepository.findById(line.referenceId);
          if (!service) {
            throw DomainException.of(`Service '${line.referenceId}' not found`);
          }
          return {
            type: 'SERVICE' as const,
            referenceId: line.referenceId,
            description: service.name,
            quantity: line.quantity,
            frozenUnitPrice: Number(service.basePrice),
          };
        }

        const part = await this.partRepository.findById(line.referenceId);
        if (!part) {
          throw DomainException.of(`Part '${line.referenceId}' not found`);
        }
        return {
          type: 'PART' as const,
          referenceId: line.referenceId,
          description: part.name,
          quantity: line.quantity,
          frozenUnitPrice: Number(part.unitPrice),
        };
      }),
    );
  }

  /**
   * Avanca a OS para AGUARDANDO_APROVACAO respeitando a maquina de estados.
   * - RECEBIDA: passa por EM_DIAGNOSTICO antes (sem pular etapas).
   * - EM_DIAGNOSTICO: avanca direto.
   * - EM_EXECUCAO: reorcamento — limpa o orcamento aprovado e volta.
   * - Demais estados (ja aguardando ou terminais): nao mexe.
   */
  private advanceToAwaitingApproval(serviceOrder: ServiceOrder): void {
    switch (serviceOrder.status) {
      case ServiceOrderStatus.RECEBIDA:
        serviceOrder.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO, 'system');
        serviceOrder.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'system');
        break;
      case ServiceOrderStatus.EM_DIAGNOSTICO:
        serviceOrder.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'system');
        break;
      case ServiceOrderStatus.EM_EXECUCAO:
        serviceOrder.clearBudget();
        serviceOrder.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'system');
        break;
      default:
        // Ja em AGUARDANDO_APROVACAO ou estado terminal: mantem.
        break;
    }
  }
}
