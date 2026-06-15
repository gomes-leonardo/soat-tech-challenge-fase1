import { CreateServiceOrderUseCase } from '@application/service-order/create-service-order.use-case';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { ClientRepository } from '@domain/client/client-repository.port';
import { Client } from '@domain/client/client.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
describe('CreateServiceOrderUseCase', () => {
  let useCase: CreateServiceOrderUseCase;
  let mockSORepo: jest.Mocked<ServiceOrderRepository>;
  let mockClientRepo: jest.Mocked<ClientRepository>;
  let sampleClient: Client;

  beforeEach(() => {
    sampleClient = new Client({
      name: 'João',
      cpfCnpj: '529.982.247-25',
    });

    mockSORepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      findByStatus: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    mockClientRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(sampleClient),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      existsByCpfCnpj: jest.fn(),
    } as unknown as jest.Mocked<ClientRepository>;

    useCase = new CreateServiceOrderUseCase(mockSORepo, mockClientRepo);
  });

  it('should create a service order with status RECEBIDA', async () => {
    const result = await useCase.execute({
      clientId: sampleClient.id,
      description: 'Troca de óleo',
    });

    expect(result.id).toBeDefined();
    expect(result.status).toBe(ServiceOrderStatus.RECEBIDA);
    expect(result.clientId).toBe(sampleClient.id);
    expect(result.description).toBe('Troca de óleo');
    expect(mockSORepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject when client does not exist', async () => {
    mockClientRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        clientId: 'non-existent',
        description: 'Test',
      }),
    ).rejects.toThrow('not found');
  });

  it('should include vehicleId when provided', async () => {
    const result = await useCase.execute({
      clientId: sampleClient.id,
      vehicleId: 'vehicle-1',
      description: 'Troca de pneu',
    });

    expect(result.vehicleId).toBe('vehicle-1');
  });
});
