/**
 * Integration Test — Re-Budget Flow
 *
 * Verifica o fluxo completo de reorcamento ponta a ponta contra um Postgres real:
 * 1. Cria OS -> EM_EXECUCAO (com orcamento v1 aprovado)
 * 2. Reorcamento: EM_EXECUCAO -> AGUARDANDO_APROVACAO
 * 3. Cria orcamento v2 com precos diferentes
 * 4. Aprova v2, volta para EM_EXECUCAO
 * 5. Verifica: as duas versoes coexistem, historico correto, preco congelado por versao
 */
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, truncateAllTables } from '../../helpers/test-db.helper';
import { ClientOrmEntity } from '@infrastructure/database/typeorm/entities/client.orm-entity';
import { ClientTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/client.typeorm-repository';
import { PartOrmEntity } from '@infrastructure/database/typeorm/entities/part.orm-entity';
import { PartTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/part.typeorm-repository';
import { ServiceOrderOrmEntity } from '@infrastructure/database/typeorm/entities/service-order.orm-entity';
import { ServiceOrderTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/service-order.typeorm-repository';
import { BudgetOrmEntity } from '@infrastructure/database/typeorm/entities/budget.orm-entity';
import { BudgetTypeOrmRepository } from '@infrastructure/database/typeorm/repositories/budget.typeorm-repository';
import { Client } from '@domain/client/client.entity';
import { Part } from '@domain/part/part.entity';
import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { Budget } from '@domain/budget/budget.entity';

describe('Re-Budget Flow Integration', () => {
  let dataSource: DataSource;
  let clientRepo: ClientTypeOrmRepository;
  let partRepo: PartTypeOrmRepository;
  let soRepo: ServiceOrderTypeOrmRepository;
  let budgetRepo: BudgetTypeOrmRepository;

  beforeAll(async () => {
    dataSource = await setupTestDb();
    clientRepo = new ClientTypeOrmRepository(dataSource.getRepository(ClientOrmEntity));
    partRepo = new PartTypeOrmRepository(dataSource.getRepository(PartOrmEntity));
    soRepo = new ServiceOrderTypeOrmRepository(dataSource.getRepository(ServiceOrderOrmEntity));
    budgetRepo = new BudgetTypeOrmRepository(dataSource.getRepository(BudgetOrmEntity));
  }, 60000);

  afterAll(async () => {
    await teardownTestDb();
  });

  beforeEach(async () => {
    await truncateAllTables(dataSource);
  });

  function partLine(part: Part, quantity: number, frozenUnitPrice: number) {
    return {
      type: 'PART' as const,
      referenceId: part.id,
      description: part.name,
      quantity,
      frozenUnitPrice,
    };
  }

  it('should complete the full re-budget flow: execução → new budget → aguardando → execução', async () => {
    // Arrange
    const part = new Part({ name: 'Filtro', sku: 'FIL-001', unitPrice: 50, stockQuantity: 10 });
    await partRepo.save(part);

    const client = new Client({ name: 'João da Silva', cpfCnpj: '529.982.247-25' });
    await clientRepo.save(client);

    const so = new ServiceOrder({ clientId: client.id, description: 'Revisão completa' });
    so.changeStatus(ServiceOrderStatus.EM_DIAGNOSTICO, 'admin-1');
    so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'admin-1');
    await soRepo.save(so);

    // Budget v1 @ 50.0, aprovado, OS -> EM_EXECUCAO
    const v1 = new Budget({ serviceOrderId: so.id, lines: [partLine(part, 1, 50)] });
    v1.approve();
    await budgetRepo.save(v1);
    so.setBudget(v1.id);
    so.changeStatus(ServiceOrderStatus.EM_EXECUCAO, 'admin-1');
    await soRepo.save(so);

    // Act — Reorcamento: EM_EXECUCAO -> AGUARDANDO_APROVACAO
    so.clearBudget();
    so.changeStatus(ServiceOrderStatus.AGUARDANDO_APROVACAO, 'admin-1');
    await soRepo.save(so);

    // Catalogo muda o preco (nao deve afetar o orcamento v1 ja congelado)
    part.updatePrice(75);
    await partRepo.save(part);

    // Budget v2 @ 75.0, aprovado, OS volta para EM_EXECUCAO
    const existing = await budgetRepo.findLatestByServiceOrderId(so.id);
    const v2 = Budget.createNewVersion(existing!, [partLine(part, 1, 75)]);
    v2.approve();
    await budgetRepo.save(v2);
    so.setBudget(v2.id);
    so.changeStatus(ServiceOrderStatus.EM_EXECUCAO, 'admin-1');
    await soRepo.save(so);

    // Assert
    const foundSo = await soRepo.findById(so.id);
    expect(foundSo).not.toBeNull();
    expect(foundSo!.status).toBe(ServiceOrderStatus.EM_EXECUCAO);
    expect(foundSo!.budgetId).toBe(v2.id);

    const all = await budgetRepo.findByServiceOrderId(so.id);
    expect(all).toHaveLength(2);
    const found1 = all.find((b) => b.version === 1)!;
    const found2 = all.find((b) => b.version === 2)!;
    expect(found1.total).toBe(50); // congelado
    expect(found2.total).toBe(75);

    // Catalogo agora 75, mas v1 permanece congelado em 50
    const foundPart = await partRepo.findById(part.id);
    expect(foundPart!.unitPrice).toBe(75);
    expect(found1.total).toBe(50);

    // Historico inclui o caminho de reorcamento
    const statuses = foundSo!.statusHistory.entries.map((e) => e.toStatus);
    expect(statuses).toEqual([
      ServiceOrderStatus.RECEBIDA,
      ServiceOrderStatus.EM_DIAGNOSTICO,
      ServiceOrderStatus.AGUARDANDO_APROVACAO,
      ServiceOrderStatus.EM_EXECUCAO,
      ServiceOrderStatus.AGUARDANDO_APROVACAO, // re-budget
      ServiceOrderStatus.EM_EXECUCAO,
    ]);
  });

  it('should maintain budget v1 total even after catalog price changes', async () => {
    const part = new Part({ name: 'Pastilha', sku: 'PAS-001', unitPrice: 100, stockQuantity: 5 });
    await partRepo.save(part);

    const client = new Client({ name: 'Maria', cpfCnpj: '111.444.777-35' });
    await clientRepo.save(client);

    const so = new ServiceOrder({ clientId: client.id, description: 'Troca de pastilha' });
    await soRepo.save(so);

    const budget = new Budget({ serviceOrderId: so.id, lines: [partLine(part, 1, 100)] });
    await budgetRepo.save(budget);

    // Preco do catalogo muda depois
    part.updatePrice(200);
    await partRepo.save(part);

    // Persistido e relido, o total do orcamento continua congelado
    const found = await budgetRepo.findById(budget.id);
    expect(found).not.toBeNull();
    expect(found!.total).toBe(100);

    const foundPart = await partRepo.findById(part.id);
    expect(foundPart!.unitPrice).toBe(200);
  });
});
