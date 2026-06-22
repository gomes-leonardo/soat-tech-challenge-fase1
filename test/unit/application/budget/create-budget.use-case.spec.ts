import { CreateBudgetUseCase } from '@application/budget/create-budget.use-case';
import { BudgetRepository } from '@domain/budget/budget-repository.port';

describe('CreateBudgetUseCase', () => {
  let useCase: CreateBudgetUseCase;
  let mockRepo: jest.Mocked<BudgetRepository>;

  const validInput = {
    serviceOrderId: 'so-123',
    lines: [
      {
        type: 'SERVICE' as const,
        referenceId: 'svc-1',
        description: 'Troca de óleo',
        quantity: 1,
        frozenUnitPrice: 150,
      },
      {
        type: 'PART' as const,
        referenceId: 'part-1',
        description: 'Filtro de óleo',
        quantity: 2,
        frozenUnitPrice: 25,
      },
    ],
  };

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByServiceOrderId: jest.fn().mockResolvedValue([]),
      findLatestByServiceOrderId: jest.fn().mockResolvedValue(null),
    } as any;
    useCase = new CreateBudgetUseCase(mockRepo);
  });

  it('should create a budget for a service order', async () => {
    const result = await useCase.execute(validInput);

    expect(result.id).toBeDefined();
    expect(result.serviceOrderId).toBe('so-123');
    expect(result.lines).toHaveLength(2);
    expect(result.total).toBe(200); // 150 + (2 * 25)
    expect(result.status).toBe('PENDENTE');
    expect(result.version).toBe(1);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should create a new version when previous budget exists (re-budget)', async () => {
    // First budget
    const firstResult = await useCase.execute(validInput);

    // Mock the first budget as existing
    const { Budget } = require('@domain/budget/budget.entity');
    const existingBudget = new Budget({
      serviceOrderId: 'so-123',
      lines: validInput.lines,
      version: 1,
    });
    mockRepo.findLatestByServiceOrderId.mockResolvedValue(existingBudget);

    // Re-budget with different lines
    const reBudgetResult = await useCase.execute({
      serviceOrderId: 'so-123',
      lines: [
        {
          type: 'SERVICE',
          referenceId: 'svc-1',
          description: 'Troca de óleo premium',
          quantity: 1,
          frozenUnitPrice: 250,
        },
      ],
    });

    expect(reBudgetResult.version).toBe(2);
    expect(reBudgetResult.total).toBe(250);
  });
});
