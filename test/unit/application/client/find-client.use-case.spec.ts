import { FindClientUseCase } from '@application/client/find-client.use-case';
import { ClientRepository } from '@domain/client/client-repository.port';
import { Client } from '@domain/client/client.entity';

describe('FindClientUseCase', () => {
  let useCase: FindClientUseCase;
  let mockRepo: jest.Mocked<ClientRepository>;
  let sampleClient: Client;

  beforeEach(() => {
    sampleClient = new Client({
      name: 'João da Silva',
      cpfCnpj: '529.982.247-25',
      email: 'joao@email.com',
    });

    mockRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCpfCnpj: jest.fn(),
      findAll: jest.fn(),
      existsByCpfCnpj: jest.fn(),
    } as unknown as jest.Mocked<ClientRepository>;

    useCase = new FindClientUseCase(mockRepo);
  });

  describe('findById', () => {
    it('should return client when found', async () => {
      mockRepo.findById.mockResolvedValue(sampleClient);

      const result = await useCase.findById(sampleClient.id);

      expect(result).not.toBeNull();
      expect(result!.name).toBe('João da Silva');
    });

    it('should return null when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const result = await useCase.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByCpfCnpj', () => {
    it('should strip formatting and search by digits', async () => {
      mockRepo.findByCpfCnpj.mockResolvedValue(sampleClient);

      await useCase.findByCpfCnpj('529.982.247-25');

      expect(mockRepo.findByCpfCnpj).toHaveBeenCalledWith('52998224725');
    });

    it('should return null when not found', async () => {
      mockRepo.findByCpfCnpj.mockResolvedValue(null);

      const result = await useCase.findByCpfCnpj('529.982.247-25');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all clients', async () => {
      mockRepo.findAll.mockResolvedValue([sampleClient]);

      const result = await useCase.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('João da Silva');
    });
  });
});
