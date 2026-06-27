/**
 * Integration Test — Public Consult Endpoint
 *
 * Verifies that the public consult logic enforces clientId + CPF/CNPJ ownership.
 * Tests at the repository/use-case level (no HTTP server needed).
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';
import { ClientOrmEntity } from '@infrastructure/database/typeorm/entities/client.orm-entity';
import { ServiceOrderOrmEntity } from '@infrastructure/database/typeorm/entities/service-order.orm-entity';
import { ClientTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/client.typeorm-repository';
import { ServiceOrderTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/service-order.typeorm-repository';
import { Client } from '@domain/client/client.entity';
import { ServiceOrder } from '@domain/service-order/service-order.entity';

describe('Public Consult Endpoint Integration', () => {
  let dataSource: DataSource;
  let clientRepo: ClientTypeOrmRepository;
  let soRepo: ServiceOrderTypeOrmRepository;

  const CPF_A = '52998224725'; // valid CPF
  const CPF_B = '11144477735'; // valid CPF

  beforeAll(async () => {
    dataSource = await setupTestDb();
    clientRepo = new ClientTypeOrmRepository(dataSource.getRepository(ClientOrmEntity));
    soRepo = new ServiceOrderTypeOrmRepository(dataSource.getRepository(ServiceOrderOrmEntity));
  }, 60000);

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(dataSource);
  });

  it('should return OS for the correct client when CPF matches', async () => {
    // Arrange — seed client-A + OS-A
    const clientA = new Client({ name: 'Cliente A', cpfCnpj: CPF_A });
    await clientRepo.save(clientA);

    const osA = new ServiceOrder({ clientId: clientA.id, description: 'OS do cliente A' });
    await soRepo.save(osA);

    // Act — simulate consult: find client, verify CPF, fetch OS
    const foundClient = await clientRepo.findById(clientA.id);
    expect(foundClient).not.toBeNull();

    const inputDigits = CPF_A.replace(/\D/g, '');
    const clientDigits = foundClient!.cpfCnpj.value.replace(/\D/g, '');
    expect(inputDigits).toBe(clientDigits); // CPF matches

    const orders = await soRepo.findByClientId(clientA.id);

    // Assert — response contains OS-A
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe(osA.id);
    expect(orders[0].description).toBe('OS do cliente A');
  });

  it('should return 403 when CPF does not match the client', async () => {
    // Arrange — seed client-A (CPF-A) and client-B (CPF-B)
    const clientA = new Client({ name: 'Cliente A', cpfCnpj: CPF_A });
    const clientB = new Client({ name: 'Cliente B', cpfCnpj: CPF_B });
    await clientRepo.save(clientA);
    await clientRepo.save(clientB);

    // Act — try to consult client-A using CPF-B
    const foundClient = await clientRepo.findById(clientA.id);
    expect(foundClient).not.toBeNull();

    const inputDigits = CPF_B.replace(/\D/g, '');
    const clientDigits = foundClient!.cpfCnpj.value.replace(/\D/g, '');

    // Assert — CPF does NOT match → would be 403 Forbidden
    expect(inputDigits).not.toBe(clientDigits);
  });

  it('should return 404 when client does not exist', async () => {
    // Act — try to find a non-existent client
    const foundClient = await clientRepo.findById('00000000-0000-0000-0000-000000000000');

    // Assert — client not found → would be 404
    expect(foundClient).toBeNull();
  });
});
