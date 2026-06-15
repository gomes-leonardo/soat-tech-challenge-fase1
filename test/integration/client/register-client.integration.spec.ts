/**
 * INTEGRATION TEST — Reference Implementation #1
 *
 * This test demonstrates the integration test pattern:
 * 1. Spin up a real PostgreSQL container (testcontainers)
 * 2. Execute the use case against the real database
 * 3. Verify data was persisted and can be read back
 *
 * Study this file as a model for writing your own integration tests (GAP D).
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';
import { ClientOrmEntity } from '@infrastructure/database/typeorm/entities/client.orm-entity';
import { ClientTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/client.typeorm-repository';
import { Client } from '@domain/client/client.entity';

describe('RegisterClient Integration', () => {
  let dataSource: DataSource;
  let repository: ClientTypeOrmRepository;

  beforeAll(async () => {
    dataSource = await setupTestDb();
    const ormRepo = dataSource.getRepository(ClientOrmEntity);
    repository = new ClientTypeOrmRepository(ormRepo);
  }, 60000);

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(dataSource);
  });

  it('should persist a client and read it back', async () => {
    // Arrange
    const client = new Client({
      name: 'João da Silva',
      cpfCnpj: '529.982.247-25',
      email: 'joao@email.com',
      phone: '(11) 99999-0000',
    });

    // Act
    await repository.save(client);
    const found = await repository.findById(client.id);

    // Assert
    expect(found).not.toBeNull();
    expect(found!.id).toBe(client.id);
    expect(found!.name).toBe('João da Silva');
    expect(found!.cpfCnpj.value).toBe('52998224725');
    expect(found!.email).toBe('joao@email.com');
  });

  it('should find a client by CPF/CNPJ', async () => {
    const client = new Client({
      name: 'Maria',
      cpfCnpj: '111.444.777-35',
    });

    await repository.save(client);
    const found = await repository.findByCpfCnpj('11144477735');

    expect(found).not.toBeNull();
    expect(found!.name).toBe('Maria');
  });

  it('should report existence by CPF/CNPJ', async () => {
    const client = new Client({
      name: 'Carlos',
      cpfCnpj: '529.982.247-25',
    });

    await repository.save(client);

    const exists = await repository.existsByCpfCnpj('52998224725');
    const notExists = await repository.existsByCpfCnpj('11144477735');

    expect(exists).toBe(true);
    expect(notExists).toBe(false);
  });
});
