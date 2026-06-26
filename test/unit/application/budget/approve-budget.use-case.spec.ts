import { ApproveBudgetUseCase } from '@application/budget/approve-budget.use-case';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { PartRepository } from '@domain/part/part-repository.port';
import { Budget } from '@domain/budget/budget.entity';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { Part } from '@domain/part/part.entity';

describe('ApproveBudgetUseCase', () => {
  let useCase: ApproveBudgetUseCase;
  let mockBudgetRepo: jest.Mocked<BudgetRepository>;
  let mockSORepo: jest.Mocked<ServiceOrderRepository>;
  let mockPartRepo: jest.Mocked<PartRepository>;

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

    mockPartRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findBySku: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;

    useCase = new ApproveBudgetUseCase(mockBudgetRepo, mockSORepo, mockPartRepo);
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

  it('should decrement part stock on approval (baixa de estoque)', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'PART',
          referenceId: 'part-1',
          description: 'Filtro',
          quantity: 3,
          frozenUnitPrice: 25,
        },
      ],
    });
    mockBudgetRepo.findById.mockResolvedValue(budget);

    const part = new Part({ name: 'Filtro', sku: 'FIL-1', unitPrice: 25, stockQuantity: 10 });
    mockPartRepo.findById.mockResolvedValue(part);

    await useCase.execute(budget.id);

    expect(part.stockQuantity).toBe(7); // 10 - 3
    expect(mockPartRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should block approval when stock is insufficient', async () => {
    const budget = new Budget({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'PART',
          referenceId: 'part-1',
          description: 'Filtro',
          quantity: 5,
          frozenUnitPrice: 25,
        },
      ],
    });
    mockBudgetRepo.findById.mockResolvedValue(budget);

    const part = new Part({ name: 'Filtro', sku: 'FIL-1', unitPrice: 25, stockQuantity: 2 });
    mockPartRepo.findById.mockResolvedValue(part);

    await expect(useCase.execute(budget.id)).rejects.toThrow('insuficiente');
    // Nao deve aprovar nem mexer no estoque
    expect(mockBudgetRepo.save).not.toHaveBeenCalled();
    expect(mockPartRepo.save).not.toHaveBeenCalled();
    expect(part.stockQuantity).toBe(2);
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
