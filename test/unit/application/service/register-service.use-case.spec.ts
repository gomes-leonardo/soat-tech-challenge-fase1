import { RegisterServiceUseCase } from '@application/service/register-service.use-case';
import { ServiceRepository } from '@domain/service/service-repository.port';
import { Service } from '@domain/service/service.entity';

describe('RegisterServiceUseCase', () => {
  let useCase: RegisterServiceUseCase;
  let mockRepo: jest.Mocked<ServiceRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;
    useCase = new RegisterServiceUseCase(mockRepo);
  });

  it('should register a new service successfully', async () => {
    const result = await useCase.execute({
      name: 'Troca de óleo',
      basePrice: 150,
      estimatedMinutes: 30,
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Troca de óleo');
    expect(result.basePrice).toBe(150);
    expect(result.estimatedMinutes).toBe(30);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject duplicate service name', async () => {
    mockRepo.findByName.mockResolvedValue(
      Service.reconstitute('existing-id', 'Troca de óleo', 150, 30),
    );

    await expect(
      useCase.execute({
        name: 'Troca de óleo',
        basePrice: 150,
        estimatedMinutes: 30,
      }),
    ).rejects.toThrow('already exists');
  });
});
