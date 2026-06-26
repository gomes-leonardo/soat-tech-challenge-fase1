import { ServiceOrder } from '@domain/service-order/service-order.entity';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';
import { StatusHistory } from '@domain/service-order/status-history.vo';

describe('ServiceOrder mutations', () => {
  describe('updateDescription', () => {
    it('should update the description (trimmed)', () => {
      const so = new ServiceOrder({ clientId: 'c1', description: 'Revisão' });
      so.updateDescription('  Troca de óleo e filtro  ');
      expect(so.description).toBe('Troca de óleo e filtro');
    });

    it('should reject an empty description', () => {
      const so = new ServiceOrder({ clientId: 'c1', description: 'Revisão' });
      expect(() => so.updateDescription('   ')).toThrow('description');
    });
  });

  describe('clearBudget', () => {
    it('should clear the budget reference', () => {
      const so = new ServiceOrder({ clientId: 'c1', description: 'Revisão' });
      so.setBudget('budget-1');
      expect(so.budgetId).toBe('budget-1');
      so.clearBudget();
      expect(so.budgetId).toBeNull();
    });
  });

  describe('reconstitute', () => {
    it('should rebuild a service order from persistence', () => {
      const history = new StatusHistory();
      history.record(null, ServiceOrderStatus.RECEBIDA, 'system');
      history.record(ServiceOrderStatus.RECEBIDA, ServiceOrderStatus.EM_DIAGNOSTICO, 'admin-1');

      const so = ServiceOrder.reconstitute(
        'so-1',
        'client-1',
        'vehicle-1',
        'Revisão completa',
        ServiceOrderStatus.EM_DIAGNOSTICO,
        history,
        'budget-1',
      );

      expect(so.id).toBe('so-1');
      expect(so.clientId).toBe('client-1');
      expect(so.vehicleId).toBe('vehicle-1');
      expect(so.description).toBe('Revisão completa');
      expect(so.status).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
      expect(so.budgetId).toBe('budget-1');
      expect(so.statusHistory.length).toBe(2);
    });
  });
});
