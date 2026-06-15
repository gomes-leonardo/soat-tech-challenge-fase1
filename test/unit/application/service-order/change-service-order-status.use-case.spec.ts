import { ChangeServiceOrderStatusUseCase } from '@application/service-order/change-service-order-status.use-case';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
describe('ChangeServiceOrderStatusUseCase', () => {
  let useCase: ChangeServiceOrderStatusUseCase;
  let mockRepo: jest.Mocked<ServiceOrderRepository>;
  let sampleSO: ServiceOrder;

  beforeEach(() => {
    sampleSO = new ServiceOrder({
      clientId: 'client-1',
      description: 'Test OS',
    });

    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(sampleSO),
      findByClientId: jest.fn(),
      findByStatus: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    useCase = new ChangeServiceOrderStatusUseCase(mockRepo);
  });

  it('should transition to the next valid status', async () => {
    const result = await useCase.execute({
      serviceOrderId: sampleSO.id,
      newStatus: ServiceOrderStatus.EM_DIAGNOSTICO,
      changedBy: 'admin-1',
    });

    expect(result.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject invalid transition', async () => {
    await expect(
      useCase.execute({
        serviceOrderId: sampleSO.id,
        newStatus: ServiceOrderStatus.FINALIZADA,
        changedBy: 'admin-1',
      }),
    ).rejects.toThrow('Invalid transition');
  });

  it('should throw when service order not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serviceOrderId: 'non-existent',
        newStatus: ServiceOrderStatus.EM_DIAGNOSTICO,
        changedBy: 'admin-1',
      }),
    ).rejects.toThrow('not found');
  });
});
