import { Guard } from '@domain/shared/guard';

describe('Guard', () => {
  describe('againstNullOrUndefined', () => {
    it('should fail for null, undefined or empty string', () => {
      expect(Guard.againstNullOrUndefined(null, 'name').isFail).toBe(true);
      expect(Guard.againstNullOrUndefined(undefined, 'name').isFail).toBe(true);
      expect(Guard.againstNullOrUndefined('', 'name').isFail).toBe(true);
    });

    it('should pass for a present value', () => {
      expect(Guard.againstNullOrUndefined('value', 'name').isOk).toBe(true);
    });
  });

  describe('againstNegative', () => {
    it('should fail for negative numbers', () => {
      const result = Guard.againstNegative(-1, 'price');
      expect(result.isFail).toBe(true);
      expect(result.getError()).toContain('price');
    });

    it('should pass for zero and positives', () => {
      expect(Guard.againstNegative(0, 'price').isOk).toBe(true);
      expect(Guard.againstNegative(10, 'price').isOk).toBe(true);
    });
  });

  describe('isOneOf', () => {
    it('should fail when the value is not allowed', () => {
      expect(Guard.isOneOf('X', ['A', 'B'], 'type').isFail).toBe(true);
    });

    it('should pass when the value is allowed', () => {
      expect(Guard.isOneOf('A', ['A', 'B'], 'type').isOk).toBe(true);
    });
  });

  describe('againstAtLeast', () => {
    it('should fail when shorter than required', () => {
      expect(Guard.againstAtLeast(6, '123', 'password').isFail).toBe(true);
    });

    it('should pass when long enough', () => {
      expect(Guard.againstAtLeast(3, 'abcd', 'password').isOk).toBe(true);
    });
  });
});
