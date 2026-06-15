/**
 * GAP A — Plate Value Object Tests
 *
 * These tests are COMPLETE and will FAIL until you implement Plate.create().
 * Your goal: make every test below pass by implementing the validation logic
 * in src/domain/vehicle/plate.vo.ts.
 *
 * Study the CpfCnpj value object tests (test/unit/domain/client/cpf-cnpj.vo.spec.ts)
 * as a reference for the pattern.
 */
import { Plate } from '@domain/vehicle/plate.vo';

describe('Plate Value Object', () => {
  describe('old Brazilian format (ABC-1234)', () => {
    it('should accept a valid old-format plate with dash', () => {
      const result = Plate.create('ABC-1234');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1234');
    });

    it('should accept a valid old-format plate without dash', () => {
      const result = Plate.create('ABC1234');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1234');
    });

    it('should normalize lowercase to uppercase', () => {
      const result = Plate.create('abc-1234');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1234');
    });

    it('should strip spaces', () => {
      const result = Plate.create(' ABC - 1234 ');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1234');
    });
  });

  describe('Mercosul format (ABC1D23)', () => {
    it('should accept a valid Mercosul plate', () => {
      const result = Plate.create('ABC1D23');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1D23');
    });

    it('should normalize lowercase Mercosul plate', () => {
      const result = Plate.create('abc1d23');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('ABC1D23');
    });

    it('should accept another valid Mercosul plate', () => {
      const result = Plate.create('BRA2E19');
      expect(result.isOk).toBe(true);
      expect(result.getValue().value).toBe('BRA2E19');
    });
  });

  describe('invalid plates', () => {
    it('should reject empty string', () => {
      const result = Plate.create('');
      expect(result.isFail).toBe(true);
    });

    it('should reject null input', () => {
      const result = Plate.create(null as unknown as string);
      expect(result.isFail).toBe(true);
    });

    it('should reject too-short input', () => {
      const result = Plate.create('AB12');
      expect(result.isFail).toBe(true);
    });

    it('should reject too-long input', () => {
      const result = Plate.create('ABCD12345');
      expect(result.isFail).toBe(true);
    });

    it('should reject all-digits', () => {
      const result = Plate.create('1234567');
      expect(result.isFail).toBe(true);
    });

    it('should reject all-letters', () => {
      const result = Plate.create('ABCDEFG');
      expect(result.isFail).toBe(true);
    });

    it('should reject special characters', () => {
      const result = Plate.create('AB@-1234');
      expect(result.isFail).toBe(true);
    });

    it('should reject plate with wrong Mercosul letter position', () => {
      // Mercosul: 3 letters, 1 digit, 1 letter, 2 digits
      // This has the letter in the wrong position
      const result = Plate.create('ABC12D3');
      expect(result.isFail).toBe(true);
    });
  });

  describe('equality', () => {
    it('should be equal for the same plate value', () => {
      const a = Plate.create('ABC-1234');
      const b = Plate.create('ABC1234');
      expect(a.getValue().equals(b.getValue())).toBe(true);
    });

    it('should not be equal for different plates', () => {
      const a = Plate.create('ABC-1234');
      const b = Plate.create('XYZ-9999');
      expect(a.getValue().equals(b.getValue())).toBe(false);
    });
  });
});
