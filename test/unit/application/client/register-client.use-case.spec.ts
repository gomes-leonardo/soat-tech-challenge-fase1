import { RegisterClientUseCase } from '@application/client/register-client.use-case';
import { ClientRepository } from '@domain/client/client-repository.port';
describe('RegisterClientUseCase', () => {
  let useCase: RegisterClientUseCase;
  let mockRepo: jest.Mocked<ClientRepository>;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      existsByCpfCnpj: jest.fn().mockResolvedValue(false),
    } as unknown as jest.Mocked<ClientRepository>;

    useCase = new RegisterClientUseCase(mockRepo);
  });

  it('should register a client successfully', async () => {
    const result = await useCase.execute({
      name: 'João da Silva',
      cpfCnpj: '529.982.247-25',
      email: 'joao@email.com',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('João da Silva');
    expect(result.cpfCnpj).toBe('529.982.247-25');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should reject duplicate CPF/CNPJ', async () => {
    mockRepo.existsByCpfCnpj.mockResolvedValue(true);

    await expect(
      useCase.execute({
        name: 'Duplicate',
        cpfCnpj: '529.982.247-25',
      }),
    ).rejects.toThrow('already exists');

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should reject invalid CPF', async () => {
    await expect(
      useCase.execute({
        name: 'Invalid',
        cpfCnpj: '123.456.789-00',
      }),
    ).rejects.toThrow();

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('should strip CPF formatting when checking uniqueness', async () => {
    await useCase.execute({
      name: 'Test',
      cpfCnpj: '529.982.247-25',
    });

    expect(mockRepo.existsByCpfCnpj).toHaveBeenCalledWith('52998224725');
  });
});
