import { Part } from '@domain/part/part.entity';

describe('Part mutations', () => {
  const base = () =>
    new Part({ name: 'Filtro de óleo', sku: 'fil-001', unitPrice: 25, stockQuantity: 10 });

  describe('updateName', () => {
    it('should update the name (trimmed)', () => {
      const part = base();
      part.updateName('  Filtro de ar  ');
      expect(part.name).toBe('Filtro de ar');
    });

    it('should reject an empty name', () => {
      expect(() => base().updateName('   ')).toThrow('name');
    });
  });

  describe('sku normalization', () => {
    it('should store the sku uppercased', () => {
      expect(base().sku).toBe('FIL-001');
    });
  });

  describe('reconstitute', () => {
    it('should rebuild a part from persistence', () => {
      const part = Part.reconstitute('part-1', 'Pastilha', 'PAS-001', 80.5, 7);
      expect(part.id).toBe('part-1');
      expect(part.name).toBe('Pastilha');
      expect(part.sku).toBe('PAS-001');
      expect(part.unitPrice).toBe(80.5);
      expect(part.stockQuantity).toBe(7);
    });
  });
});
