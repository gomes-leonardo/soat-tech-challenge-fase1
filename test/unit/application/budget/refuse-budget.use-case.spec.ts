import { RefuseBudgetUseCase } from '@application/budget/refuse-budget.use-case';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { Budget } from '@domain/budget/budget.entity';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

describe('RefuseBudgetUseCase', () => {
  let useCase: RefuseBudgetUseCase;
  let mockRepo: jest.Mocked<BudgetRepository>;
  let mockSORepo: jest.Mocked<ServiceOrderRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByServiceOrderId: jest.fn().mockResolvedValue([]),
      findLatestByServiceOrderId: jest.fn().mockResolvedValue(null),
    } as any;
    mockSORepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByClientId: jest.fn().mockResolvedValue([]),
      findByStatus: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([]),
    } as any;
    useCase = new RefuseBudgetUseCase(mockRepo, mockSORepo);
  });

  it('should refuse a budget', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'PART',
          referenceId: 'part-1',
          description: 'Filtro',
          quantity: 1,
          frozenUnitPrice: 50,
        },
      ],
    });
    mockRepo.findById.mockResolvedValue(budget);

    const result = await useCase.execute(budget.id);

    expect(result.status).toBe('RECUSADO');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should close the service order without execution when it is awaiting approval', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'PART',
          referenceId: 'part-1',
          description: 'Filtro',
          quantity: 1,
          frozenUnitPrice: 50,
        },
      ],
    });
    mockRepo.findById.mockResolvedValue(budget);

    const so = new ServiceOrder({ clientId: 'client-1', description: 'Revisão' });
    so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO, 'admin');
    so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'admin');
    mockSORepo.findById.mockResolvedValue(so);

    await useCase.execute(budget.id);

    expect(so.status).toBe(ServiceOrderStatus.ENCERRADA_SEM_EXECUCAO);
    expect(mockSORepo.save).toHaveBeenCalledTimes(1);
  });

  it('should throw when budget not found', async () => {
    await expect(useCase.execute('nonexistent')).rejects.toThrow('not found');
  });

  it('should throw when trying to refuse non-PENDENTE budget', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'PART',
          referenceId: 'part-1',
          description: 'Filtro',
          quantity: 1,
          frozenUnitPrice: 50,
        },
      ],
    });
    budget.refuse(); // Now it's RECUSADO
    mockRepo.findById.mockResolvedValue(budget);

    await expect(useCase.execute(budget.id)).rejects.toThrow('PENDENTE');
  });
});
