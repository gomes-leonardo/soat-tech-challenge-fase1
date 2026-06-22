import { RefuseBudgetUseCase } from '@application/budget/refuse-budget.use-case';
import { BudgetRepository } from '@domain/budget/budget-repository.port';
import { Budget } from '@domain/budget/budget.entity';

describe('RefuseBudgetUseCase', () => {
  let useCase: RefuseBudgetUseCase;
  let mockRepo: jest.Mocked<BudgetRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByServiceOrderId: jest.fn().mockResolvedValue([]),
      findLatestByServiceOrderId: jest.fn().mockResolvedValue(null),
    } as any;
    useCase = new RefuseBudgetUseCase(mockRepo);
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
