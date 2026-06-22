import { ApproveBudgetUseCase } from '@application/budget/approve-budget.use-case';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { Budget } from '@domain/budget/budget.entity';
import { ServiceOrder } from '@domain/service-order/service-order.entity';

describe('ApproveBudgetUseCase', () => {
  let useCase: ApproveBudgetUseCase;
  let mockBudgetRepo: jest.Mocked<BudgetRepository>;
  let mockSORepo: jest.Mocked<ServiceOrderRepository>;

  beforeEach(() => {
    mockBudgetRepo = {
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

    useCase = new ApproveBudgetUseCase(mockBudgetRepo, mockSORepo);
  });

  it('should approve a budget and set budgetId on service order', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'SERVICE',
          referenceId: 'svc-1',
          description: 'Troca de óleo',
          quantity: 1,
          frozenUnitPrice: 150,
        },
      ],
    });
    mockBudgetRepo.findById.mockResolvedValue(budget);

    const serviceOrder = new ServiceOrder({
      clientId: 'client-1',
      description: 'Revisão geral',
    });
    mockSORepo.findById.mockResolvedValue(serviceOrder);

    const result = await useCase.execute(budget.id);

    expect(result.status).toBe('APROVADO');
    expect(mockBudgetRepo.save).toHaveBeenCalledTimes(1);
    expect(mockSORepo.save).toHaveBeenCalledTimes(1);
    // Verify the service order had setBudget called
    expect(serviceOrder.budgetId).toBe(budget.id);
  });

  it('should throw when budget not found', async () => {
    await expect(useCase.execute('nonexistent')).rejects.toThrow('not found');
  });

  it('should throw when trying to approve non-PENDENTE budget', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'SERVICE',
          referenceId: 'svc-1',
          description: 'Troca',
          quantity: 1,
          frozenUnitPrice: 100,
        },
      ],
    });
    budget.approve(); // Now it's APROVADO
    mockBudgetRepo.findById.mockResolvedValue(budget);

    await expect(useCase.execute(budget.id)).rejects.toThrow('PENDENTE');
  });
});
