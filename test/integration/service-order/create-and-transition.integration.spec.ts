/**
 * INTEGRATION TEST — Reference Implementation #2
 *
 * This test demonstrates persisting a ServiceOrder through its status transitions
 * and verifying that history rows are persisted in the JSONB column.
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';
import { ServiceOrderOrmEntity } from '@infrastructure/database/typeorm/entities/service-order.orm-entity';
import { ServiceOrderTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/service-order.typeorm-repository';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

describe('ServiceOrder Create & Transition Integration', () => {
  let dataSource: DataSource;
  let repository: ServiceOrderTypeOrmRepository;

  beforeAll(async () => {
    dataSource = await setupTestDb();
    const ormRepo = dataSource.getRepository(ServiceOrderOrmEntity);
    repository = new ServiceOrderTypeOrmRepository(ormRepo);
  }, 60000);

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(dataSource);
  });

  it('should persist a new service order with initial status', async () => {
    const so = new ServiceOrder({
      clientId: 'client-123',
      description: 'Troca de óleo',
    });

    await repository.save(so);
    const found = await repository.findById(so.id);

    expect(found).not.toBeNull();
    expect(found!.status).toBe(ServiceOrderStatus.RECEBIDA);
    expect(found!.statusHistory.length).toBe(1);
  });

  it('should persist status transitions and history', async () => {
    const so = new ServiceOrder({
      clientId: 'client-123',
      description: 'Revisão completa',
    });

    // Transition through happy path
    so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO, 'admin-1');
    so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'admin-1');
    so.setBudget('budget-1');
    so.changeStatus(ServiceOrderStatus.EM_EXECUCAO, 'admin-1');

    await repository.save(so);
    const found = await repository.findById(so.id);

    expect(found).not.toBeNull();
    expect(found!.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    expect(found!.budgetId).toBe('budget-1');

    // 1 initial + 3 transitions = 4 history entries
    expect(found!.statusHistory.length).toBe(4);

    const entries = found!.statusHistory.entries;
    expect(entries[0].toStatus).toBe(ServiceOrderStatus.RECEBIDA);
    expect(entries[1].toStatus).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
    expect(entries[2].toStatus).toBe(ServiceOrderStatus.AGUARDANDO_APROVACAO);
    expect(entries[3].toStatus).toBe(ServiceOrderStatus.EM_EXECUCAO);
  });

  it('should find service orders by client id', async () => {
    const so1 = new ServiceOrder({
      clientId: 'client-A',
      description: 'OS 1',
    });
    const so2 = new ServiceOrder({
      clientId: 'client-A',
      description: 'OS 2',
    });
    const so3 = new ServiceOrder({
      clientId: 'client-B',
      description: 'OS 3',
    });

    await repository.save(so1);
    await repository.save(so2);
    await repository.save(so3);

    const clientAOrders = await repository.findByClientId('client-A');
    const clientBOrders = await repository.findByClientId('client-B');

    expect(clientAOrders).toHaveLength(2);
    expect(clientBOrders).toHaveLength(1);
  });
});
