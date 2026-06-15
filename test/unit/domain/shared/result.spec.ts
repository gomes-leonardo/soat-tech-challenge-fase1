import { Result } from '@domain/shared';

describe('Result', () => {
  describe('ok', () => {
    it('should create a successful result', () => {
      const result = Result.ok(42);
      expect(result.isOk).toBe(true);
      expect(result.isFail).toBe(false);
      expect(result.getValue()).toBe(42);
    });
  });

  describe('fail', () => {
    it('should create a failed result', () => {
      const result = Result.fail<number>('something went wrong');
      expect(result.isOk).toBe(false);
      expect(result.isFail).toBe(true);
      expect(result.getError()).toBe('something went wrong');
    });
  });

  describe('getValue', () => {
    it('should throw when accessing value of a failed result', () => {
      const result = Result.fail<number>('error');
      expect(() => result.getValue()).toThrow('Cannot get value of a failed result');
    });
  });

  describe('getError', () => {
    it('should throw when accessing error of a successful result', () => {
      const result = Result.ok(42);
      expect(() => result.getError()).toThrow('Cannot get error of a successful result');
    });
  });
});
