import { OperationalReportUseCase } from '@application/service-order/operational-report.use-case';
import { ServiceOrderRepository } from '@domain/service-order/service-order-repository.port';
import { PartRepository } from '@domain/part/part-repository.port';
import { Part } from '@domain/part/part.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

describe('OperationalReportUseCase', () => {
  let useCase: OperationalReportUseCase;
  let mockSORepo: jest.Mocked<ServiceOrderRepository>;
  let mockPartRepo: jest.Mocked<PartRepository>;

  beforeEach(() => {
    mockSORepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByClientId: jest.fn(),
      findByStatus: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ServiceOrderRepository>;

    mockPartRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn(),
    } as unknown as jest.Mocked<PartRepository>;

    useCase = new OperationalReportUseCase(mockSORepo, mockPartRepo);
  });

  it('should return empty report when no data exists', async () => {
    const result = await useCase.execute();

    expect(result.totalOrders).toBe(0);
    expect(result.lowStockParts).toHaveLength(0);
    expect(result.averageExecutionTimeMinutes).toBe(0);
    expect(result.totalCompleted).toBe(0);
    // All statuses should be present with 0
    for (const status of Object.values(ServiceOrderStatus)) {
      expect(result.ordersByStatus[status]).toBe(0);
    }
  });

  it('should count orders by status', async () => {
    const orders = [
      { status: ServiceOrderStatus.RECEBIDA, statusHistory: { entries: [] } },
      { status: ServiceOrderStatus.RECEBIDA, statusHistory: { entries: [] } },
      { status: ServiceOrderStatus.EM_EXECUCAO, statusHistory: { entries: [] } },
      { status: ServiceOrderStatus.FINALIZADA, statusHistory: { entries: [] } },
    ];
    mockSORepo.findAll.mockResolvedValue(orders as any);

    const result = await useCase.execute();

    expect(result.totalOrders).toBe(4);
    expect(result.ordersByStatus[ServiceOrderStatus.RECEBIDA]).toBe(2);
    expect(result.ordersByStatus[ServiceOrderStatus.EM_EXECUCAO]).toBe(1);
    expect(result.ordersByStatus[ServiceOrderStatus.FINALIZADA]).toBe(1);
    expect(result.ordersByStatus[ServiceOrderStatus.ENTREGUE]).toBe(0);
  });

  it('should identify low stock parts (threshold <= 5)', async () => {
    const parts = [
      Part.reconstitute('p1', 'Filtro', 'FLT-001', 10, 3),
      Part.reconstitute('p2', 'Oleo', 'OLE-001', 50, 100),
      Part.reconstitute('p3', 'Vela', 'VEL-001', 8, 0),
      Part.reconstitute('p4', 'Correia', 'COR-001', 20, 5),
    ];
    mockPartRepo.findAll.mockResolvedValue(parts);

    const result = await useCase.execute();

    expect(result.lowStockParts).toHaveLength(3);
    expect(result.lowStockParts.map((p) => p.sku)).toEqual(
      expect.arrayContaining(['FLT-001', 'VEL-001', 'COR-001']),
    );
  });
});
