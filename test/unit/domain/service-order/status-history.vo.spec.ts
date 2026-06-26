import { StatusHistory } from '@domain/service-order/status-history.vo';
import { ServiceOrderStatus } from '@domain/service-order/service-order-status.enum';

describe('StatusHistory', () => {
  it('should start empty and record transitions', () => {
    const history = new StatusHistory();
    expect(history.length).toBe(0);

    history.record(null, ServiceOrderStatus.RECEBIDA, 'system');
    history.record(ServiceOrderStatus.RECEBIDA, ServiceOrderStatus.EM_DIAGNOSTICO, 'admin-1');

    expect(history.length).toBe(2);
    expect(history.entries[0].fromStatus).toBeNull();
    expect(history.entries[0].toStatus).toBe(ServiceOrderStatus.RECEBIDA);
    expect(history.entries[1].changedBy).toBe('admin-1');
    expect(history.entries[1].changedAt).toBeInstanceOf(Date);
  });

  it('should expose a defensive copy of entries', () => {
    const history = new StatusHistory();
    history.record(null, ServiceOrderStatus.RECEBIDA, 'system');

    const entries = history.entries as any[];
    entries.push({ foo: 'bar' });

    expect(history.length).toBe(1);
  });

  it('should round-trip through toJSON/fromJSON', () => {
    const history = new StatusHistory();
    history.record(null, ServiceOrderStatus.RECEBIDA, 'system');
    history.record(ServiceOrderStatus.RECEBIDA, ServiceOrderStatus.EM_DIAGNOSTICO, 'admin-1');

    const json = history.toJSON();
    expect(json).toHaveLength(2);

    const restored = StatusHistory.fromJSON(json);
    expect(restored.length).toBe(2);
    expect(restored.entries[1].toStatus).toBe(ServiceOrderStatus.EM_DIAGNOSTICO);
  });
});
