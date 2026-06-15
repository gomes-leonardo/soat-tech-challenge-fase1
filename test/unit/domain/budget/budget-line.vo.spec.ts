/**
 * GAP B — BudgetLine Value Object Tests
 *
 * These tests are COMPLETE and will FAIL until you implement BudgetLine.create()
 * and the lineTotal getter in src/domain/budget/budget-line.vo.ts.
 *
 * Study the CpfCnpj value object (src/domain/client/cpf-cnpj.vo.ts) for the
 * pattern of validation + creation in a value object.
 */
import { BudgetLine } from '@domain/budget/budget-line.vo';

describe('BudgetLine Value Object', () => {
  describe('creation', () => {
    it('should create a valid budget line', () => {
      const line = BudgetLine.create('PART', 'part-1', 'Filtro de óleo', 2, 35.9);
      expect(line.type).toBe('PART');
      expect(line.referenceId).toBe('part-1');
      expect(line.description).toBe('Filtro de óleo');
      expect(line.quantity).toBe(2);
      expect(line.frozenUnitPrice).toBe(35.9);
    });

    it('should create a service-type line', () => {
      const line = BudgetLine.create('SERVICE', 'svc-1', 'Troca de óleo', 1, 80.0);
      expect(line.type).toBe('SERVICE');
    });
  });

  describe('lineTotal', () => {
    it('should calculate total as quantity * frozenUnitPrice', () => {
      const line = BudgetLine.create('PART', 'part-1', 'Filtro', 3, 10.0);
      expect(line.lineTotal).toBe(30.0);
    });

    it('should calculate total for single quantity', () => {
      const line = BudgetLine.create('SERVICE', 'svc-1', 'Diagnóstico', 1, 150.0);
      expect(line.lineTotal).toBe(150.0);
    });

    it('should handle decimal prices correctly', () => {
      const line = BudgetLine.create('PART', 'part-1', 'Parafuso', 4, 2.5);
      expect(line.lineTotal).toBe(10.0);
    });
  });

  describe('validation', () => {
    it('should reject zero quantity', () => {
      expect(() => BudgetLine.create('PART', 'part-1', 'Item', 0, 10.0)).toThrow();
    });

    it('should reject negative quantity', () => {
      expect(() => BudgetLine.create('PART', 'part-1', 'Item', -1, 10.0)).toThrow();
    });

    it('should reject negative price', () => {
      expect(() => BudgetLine.create('PART', 'part-1', 'Item', 1, -5.0)).toThrow();
    });

    it('should allow zero price (free item / courtesy)', () => {
      const line = BudgetLine.create('SERVICE', 'svc-1', 'Cortesia', 1, 0);
      expect(line.frozenUnitPrice).toBe(0);
      expect(line.lineTotal).toBe(0);
    });

    it('should reject empty description', () => {
      expect(() => BudgetLine.create('PART', 'part-1', '', 1, 10.0)).toThrow();
    });
  });
});
